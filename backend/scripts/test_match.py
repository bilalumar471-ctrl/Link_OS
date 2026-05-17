import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.agents.orchestrator import OrchestratorAgent

async def main():
    agent = OrchestratorAgent()
    try:
        res = await agent.run_matching("nQyzc9vWIExTJSm70rOh")
        print("Success:", res)
    except Exception as e:
        print("Error:", repr(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
