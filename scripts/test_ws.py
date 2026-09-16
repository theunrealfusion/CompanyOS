import asyncio
import sys

import httpx
import websockets


async def listen():
    uri = "ws://localhost:8003/ws/events"
    async with websockets.connect(uri) as websocket:
        print("Connected to WS. Triggering simulation...")
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"http://localhost:8003/api/v1/companies/{sys.argv[1]}/simulate"
            )
            print("Sim API response:", resp.status_code)

        print("Listening for events...")
        try:
            for _ in range(8):  # We expect around 8 events
                message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"Received: {message}")
        except TimeoutError:
            print("Timeout waiting for events.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Provide company ID")
        sys.exit(1)
    asyncio.run(listen())
