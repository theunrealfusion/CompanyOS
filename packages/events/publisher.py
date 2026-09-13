import json
from infrastructure.nats.client import connect_nats
from packages.events.envelope import EventEnvelope

async def publish_event(envelope: EventEnvelope):
    js = await connect_nats()
    subject = f"company.{envelope.organization_id}.{envelope.event_type}"
    payload = envelope.model_dump_json().encode()
    await js.publish(subject, payload)
