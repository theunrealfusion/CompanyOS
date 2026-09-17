import asyncio
import logging

from sqlalchemy.future import select

from apps.api.database.session import async_session
from apps.api.models.organization import Company

logger = logging.getLogger(__name__)

async def run_telegram_poller():
    logger.info("Starting Telegram Poller loop...")
    while True:
        try:
            async with async_session() as db:
                # Get the first company that has telegram settings enabled
                comp = await db.scalar(select(Company).limit(1))
                if not comp:
                    await asyncio.sleep(10)
                    continue

                settings = comp.settings or {}
                bot_token = settings.get("telegram_bot_token")

                if not bot_token:
                    await asyncio.sleep(10)
                    continue

                # We would normally hit https://api.telegram.org/bot{bot_token}/getUpdates
                # But since this is a demonstration environment and we don't have a real token,
                # we just simulate a heartbeat check.

                # In production:
                # url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
                # async with httpx.AsyncClient() as client:
                #    resp = await client.get(url, timeout=30)
                #    if resp.status_code == 200:
                #        data = resp.json()
                #        for update in data.get("result", []):
                #            # process via TelegramAdapter
                #            pass

                await asyncio.sleep(5)

        except Exception as e:
            logger.error(f"Telegram poller error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_telegram_poller())
