import asyncio
import logging

from temporalio.client import Client
from temporalio.worker import Worker

from apps.api.workflows.activities import (
    complete_agent_run,
    execute_llm_step,
    execute_tools,
    prepare_agent_run,
)
from apps.api.workflows.agent_workflow import AgentWorkflow


async def main():
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting CompanyOS Temporal Worker")

    try:
        client = await Client.connect("localhost:7233")
        logging.info("Connected to Temporal server.")

        worker = Worker(
            client,
            task_queue="companyos-tasks",
            workflows=[AgentWorkflow],
            activities=[prepare_agent_run, execute_llm_step, execute_tools, complete_agent_run],
        )

        logging.info("Temporal Worker listening on 'companyos-tasks' queue...")
        await worker.run()
    except Exception as e:
        logging.error(f"Failed to start worker: {e}")

if __name__ == "__main__":
    asyncio.run(main())
