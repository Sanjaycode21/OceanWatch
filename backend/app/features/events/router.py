import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.events import publisher

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/stream")
async def stream_events():
    """Establishes an active SSE stream connection, pushing live system dispatches."""
    async def event_generator():
        queue = publisher.subscribe()
        try:
            # Yield connect signal
            yield f"data: {json.dumps({'event_type': 'connected', 'data': {}})}\n\n"
            
            while True:
                try:
                    # Wait for publisher broadcasts, timeout to yield heartbeat checks
                    event = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:
            # Clean connection termination
            pass
        finally:
            publisher.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable proxy buffering
        }
    )
