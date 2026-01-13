.PHONY: dev test prod backend frontend

# DEV
backend-dev:
	cd backend && source .venv/bin/activate && ENV=dev uvicorn app.main:app --reload

frontend-dev:
	cd frontend && npm run dev

dev:
	make -j 2 backend-dev frontend-dev


# TEST
backend-test:
	cd backend && source .venv/bin/activate && ENV=test uvicorn app.main:app

frontend-test:
	cd frontend && npm run test

test:
	make -j 2 backend-test frontend-test


# PROD (no hot reload)
backend-prod:
	cd backend && source .venv/bin/activate && ENV=prod uvicorn app.main:app

frontend-prod:
	cd frontend && npm run build && npm start

prod:
	make -j 2 backend-prod frontend-prod
