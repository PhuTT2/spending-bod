# --- Stage 1: build the frontend -----------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 2: runtime (FastAPI serves API + the built frontend) -----------
FROM python:3.12-slim AS runtime
WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY config ./config
COPY --from=frontend-builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000", "--app-dir", "backend"]
