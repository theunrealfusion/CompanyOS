from datetime import timedelta

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from apps.api.workflows.activities import (
        complete_agent_run,
        execute_llm_step,
        execute_tools,
        prepare_agent_run,
    )
    from apps.api.workflows.models import AgentWorkflowInput, LLMStepResult

@workflow.defn
class AgentWorkflow:
    def __init__(self):
        self.approval_decision = None

    @workflow.signal(name="approval_response")
    async def approval_response(self, decision: str):
        self.approval_decision = decision

    @workflow.run
    async def run(self, input_data: AgentWorkflowInput) -> str:
        await workflow.execute_activity(
            prepare_agent_run,
            input_data,
            start_to_close_timeout=timedelta(seconds=10)
        )

        step_number = 1
        is_final = False
        final_answer = ""
        context = {"history": [input_data.input_text]}

        while not is_final and step_number <= 15:
            step_result: LLMStepResult = await workflow.execute_activity(
                execute_llm_step,
                args=[input_data.run_id, step_number, context],
                start_to_close_timeout=timedelta(minutes=1)
            )

            is_final = step_result.is_final
            if is_final:
                final_answer = step_result.content or "Task completed"
                break

            context["history"].append({"assistant": step_result.content or ""})

            if step_result.tool_calls:
                tool_results = await workflow.execute_activity(
                    execute_tools,
                    args=[step_result.step_id, step_result.tool_calls, input_data.run_id],
                    start_to_close_timeout=timedelta(minutes=2)
                )

                # Check if any tool was request_approval
                approval_requested = False
                for tc in step_result.tool_calls:
                    if tc["name"] == "request_approval":
                        approval_requested = True
                        break

                context["history"].append({"tools_result": [vars(r) for r in tool_results]})

                if approval_requested:
                    # Wait for signal
                    await workflow.wait_condition(lambda: self.approval_decision is not None)
                    context["history"].append({
                        "system": f"Human approval decision received: {self.approval_decision}"
                    })
                    self.approval_decision = None # reset

            step_number += 1

        await workflow.execute_activity(
            complete_agent_run,
            args=[input_data.run_id, final_answer],
            start_to_close_timeout=timedelta(seconds=10)
        )

        return final_answer
