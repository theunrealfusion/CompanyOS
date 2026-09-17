import json
import logging
import os
from typing import Any

from sqlalchemy.future import select
from temporalio import activity

from apps.api.database.session import async_session
from apps.api.memory.vector_store import MemoryService
from apps.api.models.agent import Agent, Task
from apps.api.models.execution import AgentRun, AgentStep, ToolCall
from apps.api.models.organization import Company
from apps.api.services.model_router import ModelRouter
from apps.api.tools.definitions import get_core_tools
from apps.api.tools.registry import ToolExecutor
from apps.api.workflows.models import AgentWorkflowInput, LLMStepResult, ToolExecutionResult

logger = logging.getLogger(__name__)

@activity.defn
async def prepare_agent_run(input_data: AgentWorkflowInput) -> str:
    async with async_session() as db:
        run = AgentRun(
            id=input_data.run_id,
            agent_id=input_data.agent_id,
            task_id=input_data.task_id,
            input_text=input_data.input_text,
            status="RUNNING"
        )
        task = await db.scalar(select(Task).where(Task.id == input_data.task_id))
        if task:
            run.company_id = task.company_id
            task.status = "IN_PROGRESS"

        db.add(run)
        await db.commit()
    return "OK"

@activity.defn
async def execute_llm_step(run_id: str, step_number: int, context_data: dict[str, Any]) -> LLMStepResult:
    async with async_session() as db:
        run = await db.scalar(select(AgentRun).where(AgentRun.id == run_id))
        if not run:
            raise ValueError(f"Run {run_id} not found")

        company = await db.scalar(select(Company).where(Company.id == run.company_id))
        agent = await db.scalar(select(Agent).where(Agent.id == run.agent_id))

        # Memory Injection
        memory_svc = MemoryService(db)
        # Mock embedding since we don't have an embedding model integrated
        mock_embedding = [0.0] * 1536
        recent_memories = await memory_svc.search_memory(str(run.agent_id), mock_embedding, limit=3)
        mem_text = "\n".join([m.content for m in recent_memories]) if recent_memories else "No specific memories."

        # Initialize Provider
        settings = company.settings if company else {}
        api_key = settings.get("openai_api_key", os.getenv("OPENAI_API_KEY", "dummy"))
        provider = ModelRouter.get_provider("openai", api_key)

        # Format messages
        sys_prompt = agent.system_prompt or "You are an AI assistant."
        messages = [
            {"role": "system", "content": f"{sys_prompt}\n\nRelevant Context:\n{mem_text}"},
            {"role": "user", "content": run.input_text}
        ]

        for h in context_data.get("history", []):
            if isinstance(h, str):
                pass # Already in input text
            elif isinstance(h, dict) and "tools_result" in h:
                messages.append({
                    "role": "function",
                    "name": "system",
                    "content": json.dumps(h["tools_result"])
                })
            elif isinstance(h, dict) and "assistant" in h:
                messages.append({
                    "role": "assistant",
                    "content": h["assistant"]
                })

        # Call LLM
        tools = get_core_tools()
        result = await provider.call(messages, "gpt-4o-mini", tools=tools)

        is_final = len(result.tool_calls) == 0

        # Save step
        step = AgentStep(
            run_id=run.id,
            step_number=step_number,
            step_type="SYNTHESIS" if is_final else "PLANNING",
            input_text=json.dumps(messages),
            output_text=result.content,
            model_id="gpt-4o-mini",
            tokens=result.input_tokens + result.output_tokens,
            cost=0.001
        )
        db.add(step)
        await db.flush()

        # Update run totals
        run.input_tokens = (run.input_tokens or 0) + result.input_tokens
        run.output_tokens = (run.output_tokens or 0) + result.output_tokens
        run.total_tokens = run.input_tokens + run.output_tokens
        run.cost = (run.cost or 0.0) + 0.001

        for tc in result.tool_calls:
            t = ToolCall(step_id=step.id, tool_name=tc["name"], input_args=tc["args"])
            db.add(t)

        await db.commit()

        return LLMStepResult(
            step_id=str(step.id),
            content=result.content,
            tool_calls=result.tool_calls,
            is_final=is_final
        )

@activity.defn
async def execute_tools(step_id: str, tool_calls: list[dict[str, Any]], run_id: str) -> list[ToolExecutionResult]:
    results = []
    async with async_session() as db:
        run = await db.scalar(select(AgentRun).where(AgentRun.id == run_id))
        company_id = str(run.company_id) if run else ""

        executor = ToolExecutor()
        for tc in tool_calls:
            res_data = await executor.execute(tc["name"], tc["args"], company_id, run_id)
            res = ToolExecutionResult(
                tool_call_id=tc.get("id", "temp"),
                result_data=res_data
            )
            results.append(res)

        # Optional: Save tool outputs to DB if needed
        # (Already saved as event history in Temporal)

    return results

@activity.defn
async def complete_agent_run(run_id: str, final_result: str) -> str:
    async with async_session() as db:
        run = await db.scalar(select(AgentRun).where(AgentRun.id == run_id))
        if run:
            run.status = "COMPLETED"
            run.output_text = final_result

            if run.task_id:
                task = await db.scalar(select(Task).where(Task.id == run.task_id))
                if task:
                    task.status = "COMPLETED"
                    task.result = final_result

            # Memory Extraction (save final result to vector store)
            if final_result:
                memory_svc = MemoryService(db)
                mock_embedding = [0.0] * 1536
                await memory_svc.add_memory(
                    agent_id=str(run.agent_id),
                    content=f"Task {task.title if task else ''} completed: {final_result}",
                    embedding=mock_embedding,
                    metadata={"run_id": run_id}
                )

        await db.commit()
    return "OK"
