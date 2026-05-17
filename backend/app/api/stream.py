import asyncio
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from jose import JWTError, jwt

from app.services.stream import streamer
from app.core.auth import SECRET_KEY, ALGORITHM

router = APIRouter()

@router.get("/reasoning")
async def stream_reasoning_logs(token: str = Query(None)):
    """
    Server-Sent Events (SSE) endpoint for live agent reasoning.
    Auth is via query parameter because EventSource cannot send headers.
    """
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if not payload.get("sub"):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
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
