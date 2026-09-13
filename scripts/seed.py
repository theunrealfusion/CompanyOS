import asyncio
import os
import sys

# Add parent dir to path so we can import from packages
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from packages.domain.organization import Organization
from packages.domain.human import Human
from packages.domain.agent import Agent
from packages.domain.department import Department
from packages.domain.project import Project, Objective
from packages.domain.task import Task
from infrastructure.mongodb.client import get_database

async def seed_data():
    db = get_database()
    
    # 1. Organization
    org = Organization(
        id="acme_ai_labs",
        name="Acme AI Labs",
        description="A simulated AI-native organization."
    )
    await db.organizations.update_one({"id": org.id}, {"$set": org.model_dump()}, upsert=True)
    
    # 2. Departments
    departments = [
        Department(id="dept_exec", organization_id=org.id, name="Executive"),
        Department(id="dept_prod", organization_id=org.id, name="Product"),
        Department(id="dept_eng", organization_id=org.id, name="Engineering"),
        Department(id="dept_sec", organization_id=org.id, name="Security"),
        Department(id="dept_fin", organization_id=org.id, name="Finance"),
        Department(id="dept_mktg", organization_id=org.id, name="Marketing"),
        Department(id="dept_sales", organization_id=org.id, name="Sales")
    ]
    for dept in departments:
        await db.departments.update_one({"id": dept.id}, {"$set": dept.model_dump()}, upsert=True)

    # 3. Agents
    agents = [
        Agent(id="agent_ceo", organization_id=org.id, name="CEO Agent", role="CEO", mission="Maximize company value", system_instructions="", model_provider="OpenAI", model="gpt-4o", authority=100),
        Agent(id="agent_cto", organization_id=org.id, name="CTO Agent", role="CTO", mission="Technical excellence", system_instructions="", model_provider="OpenAI", model="gpt-4o", authority=90),
        Agent(id="agent_product", organization_id=org.id, name="Product Agent", role="Product Manager", mission="Build what users want", system_instructions="", model_provider="Anthropic", model="claude-3-5-sonnet", authority=70),
        Agent(id="agent_eng", organization_id=org.id, name="Engineering Agent", role="Lead Engineer", mission="Build scalable systems", system_instructions="", model_provider="NVIDIA", model="meta/llama-3.1-405b-instruct", authority=70),
        Agent(id="agent_sec", organization_id=org.id, name="Security Agent", role="CISO", mission="Protect company assets", system_instructions="", model_provider="Google", model="gemini-1.5-pro", authority=80),
        Agent(id="agent_fin", organization_id=org.id, name="Finance Agent", role="CFO", mission="Manage runway", system_instructions="", model_provider="OpenAI", model="gpt-4o", authority=80),
        Agent(id="agent_mktg", organization_id=org.id, name="Marketing Agent", role="CMO", mission="Growth", system_instructions="", model_provider="Anthropic", model="claude-3-haiku", authority=70),
        Agent(id="agent_sales", organization_id=org.id, name="Sales Agent", role="VP Sales", mission="Revenue", system_instructions="", model_provider="OpenAI", model="gpt-4o-mini", authority=70)
    ]
    for agent in agents:
        await db.agents.update_one({"id": agent.id}, {"$set": agent.model_dump()}, upsert=True)

    # 4. Canonical Scenario: Launch Product
    objective = Objective(
        id="obj_launch",
        organization_id=org.id,
        description="Launch our new product by Friday",
        owner="agent_ceo",
        strategic_alignment="Q3 Revenue Goal"
    )
    await db.objectives.update_one({"id": objective.id}, {"$set": objective.model_dump()}, upsert=True)

    project = Project(
        id="proj_launch",
        organization_id=org.id,
        name="Product X Launch",
        objective_id=objective.id,
        owner="agent_product"
    )
    await db.projects.update_one({"id": project.id}, {"$set": project.model_dump()}, upsert=True)

    # 5. Friction
    from packages.domain.friction import Friction, Proposal, Claim, Evidence
    from packages.domain.decision import Decision

    friction = Friction(
        id="fric_launch_friday",
        organization_id=org.id,
        subject="Product Launch Timing",
        conflict_type="TIMELINE_CONFLICT",
        participants=["agent_product", "agent_eng", "agent_sec", "agent_mktg", "agent_fin"]
    )
    
    prop_product = Proposal(
        id="prop_1",
        agent_id="agent_product",
        description="Launch full product on Friday",
        claims=[
            Claim(id="c_1", description="Maximize user growth", confidence=0.9, expected_benefit=100000)
        ]
    )
    
    prop_sec = Proposal(
        id="prop_2",
        agent_id="agent_sec",
        description="Block launch due to critical vulnerability",
        claims=[
            Claim(id="c_2", description="High risk of data breach", confidence=0.95, expected_risk=0.8)
        ]
    )
    
    prop_eng = Proposal(
        id="prop_3",
        agent_id="agent_eng",
        description="Partial rollout without vulnerable component",
        claims=[
            Claim(id="c_3", description="Fix takes 2 days", confidence=0.8)
        ]
    )
    
    friction.proposals = [prop_product, prop_sec, prop_eng]
    friction.evidence = [
        Evidence(id="ev_1", agent_id="agent_sec", description="Vulnerability scan report #1234")
    ]
    friction.status = "negotiating"
    
    await db.frictions.update_one({"id": friction.id}, {"$set": friction.model_dump()}, upsert=True)

    # 6. Decision
    decision = Decision(
        id="dec_partial_rollout",
        organization_id=org.id,
        friction_id=friction.id,
        objective_id=objective.id,
        description="Approve partial rollout. Fix vulnerable component by Monday.",
        chosen_proposal_id="prop_3",
        decision_score=0.85,
        required_authority=90,
        approvers=["agent_ceo", "agent_cto"],
        status="approved"
    )
    await db.decisions.update_one({"id": decision.id}, {"$set": decision.model_dump()}, upsert=True)

    print("Successfully seeded Acme AI Labs.")

if __name__ == "__main__":
    asyncio.run(seed_data())
