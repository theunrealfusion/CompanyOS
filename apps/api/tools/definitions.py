from typing import Dict, Any

def get_core_tools() -> list[Dict[str, Any]]:
    return [
        {
            "name": "delegate_task",
            "description": "Delegate a subtask to a subordinate agent.",
            "parameters": {
                "type": "object",
                "properties": {
                    "assignee_role": {"type": "string"},
                    "task_title": {"type": "string"},
                    "task_description": {"type": "string"}
                },
                "required": ["assignee_role", "task_title"]
            }
        },
        {
            "name": "request_approval",
            "description": "Request human approval for a sensitive action or budget.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "cost": {"type": "number"},
                    "justification": {"type": "string"}
                },
                "required": ["title", "justification"]
            }
        }
    ]
