import asyncio
from typing import AsyncGenerator

class ReasoningStreamer:
    """Simple in-memory PubSub for reasoning logs."""
    def __init__(self):
        self.queues = []

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self.queues.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self.queues:
            self.queues.remove(q)

    async def publish(self, agent_name: str, message: str):
        import json
        payload = json.dumps({"agent": agent_name, "message": message})
        # Format for SSE
        sse_message = f"data: {payload}\n\n"
        for q in self.queues:
            await q.put(sse_message)

# Global singleton
streamer = ReasoningStreamer()
