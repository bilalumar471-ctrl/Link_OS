import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.services.stream import streamer

router = APIRouter()

@router.get("/reasoning")
async def stream_reasoning_logs():
    """Server-Sent Events (SSE) endpoint for live agent reasoning."""
    
    async def event_generator():
        q = streamer.subscribe()
        try:
            while True:
                # Wait for next message
                message = await q.get()
                yield message
        except asyncio.CancelledError:
            # Client disconnected
            streamer.unsubscribe(q)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
