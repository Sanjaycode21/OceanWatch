import asyncio
import logging
from typing import Set

logger = logging.getLogger("core.events")

class EventPublisher:
    def __init__(self):
        self.subscribers: Set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        """Adds a new client queue subscriber connection."""
        queue = asyncio.Queue()
        self.subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue):
        """Removes a client queue subscriber on connection close."""
        if queue in self.subscribers:
            self.subscribers.remove(queue)

    def broadcast_sync(self, event_type: str, data: dict):
        """Sync wrapper to schedule broadcast payload on the active asyncio event loop."""
        try:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self.broadcast(event_type, data))
            except RuntimeError:
                # No active loop running in current thread, run blocking
                asyncio.run(self.broadcast(event_type, data))
        except Exception as e:
            logger.error(f"EventPublisher broadcast_sync failed: {e}")

    async def broadcast(self, event_type: str, data: dict):
        """Asynchronously dispatches event payload to all active subscriber client queues."""
        payload = {"event_type": event_type, "data": data}
        if not self.subscribers:
            return
            
        for queue in list(self.subscribers):
            try:
                queue.put_nowait(payload)
            except Exception as e:
                logger.error(f"EventPublisher queue push failed: {e}")

publisher = EventPublisher()
