import os
import nats
from nats.aio.client import Client as NATS
from nats.js.client import JetStreamContext

_nc: NATS | None = None
_js: JetStreamContext | None = None

async def connect_nats() -> JetStreamContext:
    global _nc, _js
    if not _nc:
        nats_url = os.getenv("NATS_URL", "nats://localhost:4222")
        _nc = await nats.connect(nats_url)
        _js = _nc.jetstream()
    return _js

async def disconnect_nats():
    global _nc
    if _nc and not _nc.is_closed:
        await _nc.close()
