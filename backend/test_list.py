import asyncio
from app.services import dal

async def main():
    print(await dal.list_entities('programmes'))

asyncio.run(main())
