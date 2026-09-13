class SimulationEngine:
    async def snapshot_state(self, org_id: str) -> str:
        # MVP: Just return a mock snapshot ID
        return f"snap_{org_id}_123"
