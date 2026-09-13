import os
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Body, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from openai import AsyncOpenAI
import httpx

from apps.api.database.session import get_db
from apps.api.models.organization import Company

logger = logging.getLogger("companyos.models")
router = APIRouter(prefix="/models", tags=["models"])

DEFAULT_NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1"

@router.get("/nvidia")
async def get_nvidia_models(
    endpoint: Optional[str] = None,
    api_key: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all available models from NVIDIA NIM endpoint (build.nvidia.com).
    Uses provided query params, DB company settings, or environment variables.
    """
    if not endpoint:
        # Check company settings
        comp_res = await db.execute(select(Company))
        comp = comp_res.scalars().first()
        if comp and comp.settings:
            endpoint = comp.settings.get("nvidia_nim_endpoint")
            if not api_key:
                api_key = comp.settings.get("nvidia_api_key")

    if not endpoint or "localhost:8000" in endpoint:
        endpoint = os.getenv("NVIDIA_NIM_ENDPOINT", DEFAULT_NVIDIA_ENDPOINT)
    if not api_key:
        api_key = os.getenv("NVIDIA_API_KEY", "")

    endpoint = endpoint.strip().rstrip("/")
    if not endpoint or "localhost:8000" in endpoint:
        endpoint = DEFAULT_NVIDIA_ENDPOINT

    return await _fetch_models_from_endpoint(endpoint, api_key)


@router.post("/nvidia")
async def post_nvidia_models(
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all available models given an NVIDIA NIM endpoint and API key from payload.
    """
    endpoint = payload.get("endpoint", "").strip() or DEFAULT_NVIDIA_ENDPOINT
    api_key = payload.get("api_key", "").strip()

    if not api_key:
        # Fallback to DB or env
        comp_res = await db.execute(select(Company))
        comp = comp_res.scalars().first()
        if comp and comp.settings:
            api_key = comp.settings.get("nvidia_api_key", "")
        if not api_key:
            api_key = os.getenv("NVIDIA_API_KEY", "")

    endpoint = endpoint.rstrip("/")
    return await _fetch_models_from_endpoint(endpoint, api_key)


async def _fetch_models_from_endpoint(endpoint: str, api_key: str) -> Dict[str, Any]:
    try:
        # We can use AsyncOpenAI or httpx directly
        client = AsyncOpenAI(
            base_url=endpoint,
            api_key=api_key or "anonymous"
        )
        model_list = await client.models.list()
        raw_models = model_list.data

        # Process and sort models
        processed = []
        for m in raw_models:
            model_id = m.id
            owned_by = getattr(m, "owned_by", "")
            created = getattr(m, "created", None)

            # Check if model supports thinking / reasoning
            supports_thinking = any(
                term in model_id.lower()
                for term in ["ultra", "nemotron", "deepseek-r1", "reason", "r1"]
            )

            processed.append({
                "id": model_id,
                "name": model_id,
                "owned_by": owned_by,
                "created": created,
                "supports_thinking": supports_thinking,
            })

        # Sort alphabetically with reasoning / flagship models first
        def sort_key(item):
            id_lower = item["id"].lower()
            if "nemotron-3-ultra" in id_lower:
                return (0, id_lower)
            if "nemotron" in id_lower:
                return (1, id_lower)
            if "llama-3.3" in id_lower:
                return (2, id_lower)
            if "llama-3.1-405b" in id_lower:
                return (3, id_lower)
            if "deepseek" in id_lower:
                return (4, id_lower)
            return (5, id_lower)

        processed.sort(key=sort_key)

        return {
            "status": "success",
            "endpoint": endpoint,
            "count": len(processed),
            "models": processed
        }
    except Exception as e:
        logger.error(f"Failed to fetch models from NVIDIA NIM at {endpoint}: {e}")
        # Try direct HTTP request as fallback
        try:
            async with httpx.AsyncClient(timeout=10.0) as http_client:
                headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
                res = await http_client.get(f"{endpoint}/models", headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    models_data = data.get("data", [])
                    processed = [{
                        "id": m.get("id"),
                        "name": m.get("id"),
                        "owned_by": m.get("owned_by", ""),
                        "supports_thinking": "nemotron" in m.get("id", "").lower() or "ultra" in m.get("id", "").lower()
                    } for m in models_data if "id" in m]
                    return {
                        "status": "success",
                        "endpoint": endpoint,
                        "count": len(processed),
                        "models": processed
                    }
                else:
                    return {
                        "status": "error",
                        "endpoint": endpoint,
                        "count": 0,
                        "error": f"HTTP {res.status_code}: {res.text[:200]}",
                        "models": []
                    }
        except Exception as http_err:
            return {
                "status": "error",
                "endpoint": endpoint,
                "count": 0,
                "error": str(http_err),
                "models": []
            }


@router.post("/nvidia/test")
async def test_nvidia_model(payload: Dict[str, Any] = Body(...)):
    """
    Test generating completions using NVIDIA NIM endpoint.
    Implements streaming reasoning and content tokens as requested.
    """
    endpoint = payload.get("endpoint", DEFAULT_NVIDIA_ENDPOINT).strip().rstrip("/")
    api_key = payload.get("api_key", "").strip()
    model = payload.get("model", "nvidia/nemotron-3-ultra-550b-a55b")
    prompt = payload.get("prompt", "Write a limerick about the wonders of GPU computing.")
    temperature = float(payload.get("temperature", 1.0))
    top_p = float(payload.get("top_p", 0.95))
    max_tokens = int(payload.get("max_tokens", 1024))
    enable_thinking = payload.get("enable_thinking", True)

    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="NVIDIA API Key is required to test inference on build.nvidia.com"
        )

    try:
        client = AsyncOpenAI(base_url=endpoint, api_key=api_key)

        extra_body = {}
        if enable_thinking:
            extra_body["chat_template_kwargs"] = {"enable_thinking": True}

        completion = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            top_p=top_p,
            max_tokens=max_tokens,
            extra_body=extra_body if extra_body else None,
            stream=True
        )

        reasoning_tokens = []
        content_tokens = []

        async for chunk in completion:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            reasoning = getattr(delta, "reasoning_content", None)
            if reasoning:
                reasoning_tokens.append(reasoning)
            if delta.content is not None:
                content_tokens.append(delta.content)

        full_reasoning = "".join(reasoning_tokens)
        full_content = "".join(content_tokens)

        return {
            "status": "success",
            "model": model,
            "reasoning": full_reasoning,
            "content": full_content,
            "has_thinking": len(reasoning_tokens) > 0
        }
    except Exception as e:
        logger.error(f"Error testing NVIDIA model {model}: {e}")
        return {
            "status": "error",
            "model": model,
            "error": str(e)
        }
