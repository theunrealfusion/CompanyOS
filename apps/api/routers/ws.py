import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from apps.api.messaging.bus import event_bus

router = APIRouter(prefix="/ws", tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        txt = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(txt)
            except Exception:
                pass

manager = ConnectionManager()

# Background task to bridge Redis to WebSockets
async def bridge_redis_to_ws():
    async def callback(data: dict):
        await manager.broadcast(data)
    await event_bus.listen(callback)

@router.websocket("/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def publish_event(event_type: str, payload: dict):
    # Direct broadcast for simplicity if redis not up, otherwise use event_bus
    await manager.broadcast({"type": event_type, "payload": payload})
    try:
        await event_bus.publish(event_type, payload)
    except Exception:
        pass
