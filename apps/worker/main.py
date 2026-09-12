import asyncio
import logging
from temporalio.client import Client
from temporalio.worker import Worker
# from apps.worker.workflows import AgentWorkflow
# from apps.worker.activities import execute_agent_step

async def main():
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting CompanyOS Temporal Worker")
    
    # Initialize Temporal client
    # client = await Client.connect("localhost:7233")
    
    # Run a worker for the companyos task queue
    # worker = Worker(
    #    client,
    #    task_queue="companyos-tasks",
    #    workflows=[AgentWorkflow],
    #    activities=[execute_agent_step],
    # )
    # await worker.run()

if __name__ == "__main__":
    asyncio.run(main())
