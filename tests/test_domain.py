import pytest
from packages.domain.organization import Organization
from packages.domain.friction import Friction, Proposal, Claim
from packages.events.envelope import EventEnvelope

def test_organization_creation():
    org = Organization(id="org_1", name="Test Org")
    assert org.id == "org_1"
    assert org.name == "Test Org"

def test_friction_creation():
    fric = Friction(
        id="f1",
        organization_id="org_1",
        subject="Test Friction",
        conflict_type="GOAL_CONFLICT",
        participants=["p1", "p2"]
    )
    assert fric.status == "open"
    assert len(fric.participants) == 2

def test_event_envelope():
    evt = EventEnvelope(
        event_id="evt_1",
        event_type="friction.created",
        organization_id="org_1",
        actor_id="sys",
        correlation_id="corr_1",
        payload={"friction_id": "f1"}
    )
    assert evt.schema_version == 1
    assert evt.payload["friction_id"] == "f1"
