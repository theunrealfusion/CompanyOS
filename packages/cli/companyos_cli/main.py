import click
import subprocess
import os
import sys
import httpx
import asyncio

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))

@click.group()
def cli():
    """CompanyOS - Autonomous AI Company Operating System"""
    pass

@cli.command()
def doctor():
    """Check system dependencies"""
    click.echo("Running CompanyOS Doctor...")
    deps = ["python3", "docker", "npm"]
    for dep in deps:
        result = subprocess.run(["which", dep], capture_output=True, text=True)
        if result.returncode == 0:
            click.secho(f"✅ {dep} found at {result.stdout.strip()}", fg="green")
        else:
            click.secho(f"❌ {dep} is missing", fg="red")
            
@cli.command()
def start():
    """Start CompanyOS (API, Web, Worker)"""
    click.secho("Starting CompanyOS...", fg="blue")
    api_cmd = "source venv/bin/activate && export PYTHONPATH=$PWD && cd apps/api && uvicorn main:app --host 0.0.0.0 --port 8003"
    web_cmd = "cd apps/web && npm run dev -- -p 3001"
    
    click.echo("Starting Docker services...")
    subprocess.run(["sudo", "docker", "compose", "up", "-d"], cwd=BASE_DIR)
    
    click.secho("You can manually run API with:", fg="yellow")
    click.secho(api_cmd, fg="yellow")
    click.secho("You can manually run Web with:", fg="yellow")
    click.secho(web_cmd, fg="yellow")

@cli.group()
def company():
    """Company management"""
    pass

@company.command("create")
@click.option("--name", prompt="Company Name", help="The name of the company")
@click.option("--mission", prompt="Company Mission", help="The mission of the company")
def create_company(name, mission):
    """Create a new company"""
    async def create():
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post("http://localhost:8003/api/v1/companies/", params={"name": name, "mission": mission})
                if resp.status_code == 200:
                    data = resp.json()
                    click.secho(f"✅ Created Company '{data['name']}' with ID {data['id']}", fg="green")
                else:
                    click.secho(f"❌ Failed to create company: {resp.text}", fg="red")
            except Exception as e:
                click.secho(f"❌ Connection error: {e}", fg="red")
    asyncio.run(create())

@company.command("run")
@click.option("--id", prompt="Company ID", help="The ID of the company to run")
def run_company(id):
    """Run a demo simulation for the company"""
    async def trigger_run():
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(f"http://localhost:8003/api/v1/companies/{id}/simulate")
                if resp.status_code == 200:
                    click.secho(f"✅ Simulation started for Company ID {id}", fg="green")
                else:
                    click.secho(f"❌ Failed to start simulation: {resp.text}", fg="red")
            except Exception as e:
                click.secho(f"❌ Connection error: {e}", fg="red")
    asyncio.run(trigger_run())

cli.add_command(company)

@cli.group()
def settings():
    """Manage company model and gateway settings"""
    pass

@settings.command("get")
@click.option("--company-id", prompt="Company ID", help="Company ID")
def get_settings(company_id):
    """View current company settings"""
    async def fetch():
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"http://localhost:8003/api/v1/companies/{company_id}/settings")
                if resp.status_code == 200:
                    data = resp.json()
                    click.secho(f"=== Settings for Company {company_id} ===", fg="blue", bold=True)
                    for k, v in data.items():
                        click.echo(f"  {k}: {v}")
                else:
                    click.secho(f"Failed: {resp.text}", fg="red")
            except Exception as e:
                click.secho(f"Error: {e}", fg="red")
    asyncio.run(fetch())

@settings.command("set")
@click.option("--company-id", prompt="Company ID", help="Company ID")
@click.option("--key", prompt="Setting Key", help="Setting key e.g. default_model, gemini_api_key")
@click.option("--value", prompt="Setting Value", help="New value")
def set_setting(company_id, key, value):
    """Update a specific company setting"""
    async def update():
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.put(f"http://localhost:8003/api/v1/companies/{company_id}/settings", json={key: value})
                if resp.status_code == 200:
                    click.secho(f"✅ Updated {key} = {value}", fg="green")
                else:
                    click.secho(f"Failed: {resp.text}", fg="red")
            except Exception as e:
                click.secho(f"Error: {e}", fg="red")
    asyncio.run(update())

cli.add_command(settings)

if __name__ == "__main__":
    cli()
