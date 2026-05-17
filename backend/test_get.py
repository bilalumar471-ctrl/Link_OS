import asyncio
from app.services import dal

async def main():
    print("Get prog-fintech-2026:", await dal.get_entity('programmes', 'prog-fintech-2026'))

asyncio.run(main())
