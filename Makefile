.PHONY: dev test lint format build seed reset

dev:
	docker-compose -f docker-compose.yml up --build

test:
	pytest tests/

lint:
	flake8 apps packages
	mypy apps packages

format:
	black apps packages
	isort apps packages

build:
	docker-compose build

seed:
	PYTHONPATH=. python scripts/seed.py

reset:
	docker-compose down -v
