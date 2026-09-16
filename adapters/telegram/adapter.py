import logging


class TelegramAdapter:
    def __init__(self, token: str):
        self.token = token

    async def start(self):
        logging.info("Starting Telegram adapter (Mock)")
        # In a real scenario, this would start python-telegram-bot or aiogram

    async def send_message(self, chat_id: str, text: str):
        logging.info(f"Sending to Telegram {chat_id}: {text}")
