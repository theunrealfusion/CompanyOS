import asyncio
import logging
import json
from infrastructure.nats.client import connect_nats, disconnect_nats
from packages.memory.core import MemoryStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("companyos.worker")

async def process_message(msg):
    try:
        data = json.loads(msg.data.decode())
        logger.info(f"Received event: {msg.subject} - {data.get('event_id')}")
        
        # Store in episodic memory
        store = MemoryStore()
        org_id = data.get("organization_id", "unknown")
        await store.store_episodic(org_id, data)
        
        await msg.ack()
    except Exception as e:
        logger.error(f"Failed to process message: {e}")

async def main():
    logger.info("Starting CompanyOS Worker...")
    js = await connect_nats()
    
    # Create or update the stream for organizational events
    try:
        await js.add_stream(name="COMPANY_EVENTS", subjects=["company.*.>"])
    except Exception as e:
        logger.info(f"Stream may already exist: {e}")

    # Subscribe to all company events
    sub = await js.subscribe("company.*.>", cb=process_message, durable="worker_memory_sink")
    
    logger.info("Worker listening to JetStream...")
    try:
        while True:
            await asyncio.sleep(1)
    finally:
        await disconnect_nats()

if __name__ == "__main__":
    asyncio.run(main())

