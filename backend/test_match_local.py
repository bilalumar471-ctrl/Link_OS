import asyncio
from app.agents.orchestrator import OrchestratorAgent

async def main():
    try:
        agent = OrchestratorAgent()
        res = await agent.run_matching("prog-greentech-scale")
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
