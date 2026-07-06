


import { NextRequest, NextResponse } from 'next/server';
import type { ModelResult, ParsedDataset } from '@/lib/types';

export const runtime = 'nodejs';

interface ReqBody {
  model: ModelResult;
  dataset: ParsedDataset;
  projectId: string;
}

function genApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = 'af_';
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function buildFastApiService(model: ModelResult, dataset: ParsedDataset): string {
  const features = dataset.schema.filter((c) => c.role === 'feature').map((c) => c.name);
  const featurePyType = (col: typeof dataset.schema[number]) => {
    if (col.type === 'numerical') return 'float';
    if (col.type === 'boolean') return 'bool';
    return 'str';
  };
  const featureDefs = features.map((f) => {
    const col = dataset.schema.find((c) => c.name === f)!;
    return `    ${f.replace(/[^a-zA-Z0-9_]/g, '_')}: ${featurePyType(col)} = Field(...)`;
  }).join('\n');

  return `"""
AutoForge — Automated inference service
Model: ${model.name}
Task: ${model.taskType}
Generated: ${new Date().toISOString()}
"""
from fastapi import FastAPI, HTTPException, Security, Header
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import List, Optional
import joblib
import os
import pandas as pd

MODEL_PATH = os.environ.get("MODEL_PATH", "/models/${model.id}.joblib")
API_KEY = os.environ.get("AUTOFORGE_API_KEY", "${genApiKey()}")

app = FastAPI(
    title="AutoForge AI — ${model.name}",
    description="Auto-generated inference endpoint for project ${dataset.filename}",
    version="1.0.0",
)
api_key_header = APIKeyHeader(name="X-API-Key")

_model = joblib.load(MODEL_PATH)

class PredictionRequest(BaseModel):
${featureDefs}

class PredictionResponse(BaseModel):
    prediction: object
    probabilities: Optional[List[float]] = None
    model: str
    latency_ms: float

@app.get("/health")
def health():
    return {"status": "ok", "model": "${model.name}", "loaded": _model is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest, api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    import time
    t0 = time.perf_counter()
    payload = pd.DataFrame([req.model_dump()])
    pred = _model.predict(payload)[0]
    proba = None
    if hasattr(_model, "predict_proba"):
        proba = _model.predict_proba(payload)[0].tolist()
    latency = (time.perf_counter() - t0) * 1000
    return PredictionResponse(prediction=pred, probabilities=proba, model="${model.name}", latency_ms=latency)

@app.post("/predict/batch")
def predict_batch(items: List[PredictionRequest], api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    import time
    t0 = time.perf_counter()
    payload = pd.DataFrame([it.model_dump() for it in items])
    preds = _model.predict(payload).tolist()
    latency = (time.perf_counter() - t0) * 1000
    return {"predictions": preds, "count": len(preds), "latency_ms": latency}
`;
}

function buildDockerfile(model: ModelResult): string {
  return `# AutoForge — Production Dockerfile
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 \\
    PIP_NO_CACHE_DIR=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY model.joblib /models/${model.id}.joblib

EXPOSE 8000
ENV MODEL_PATH=/models/${model.id}.joblib

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
`;
}

function buildDockerCompose(model: ModelResult): string {
  return `version: "3.9"
services:
  autoforge-model:
    build: .
    image: autoforge/${model.id}:latest
    container_name: autoforge-${model.id}
    ports:
      - "8000:8000"
    environment:
      - AUTOFORGE_API_KEY=\${AUTOFORGE_API_KEY}
      - MODEL_PATH=/models/${model.id}.joblib
    volumes:
      - ./model.joblib:/models/${model.id}.joblib:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
`;
}

function buildRequirements(): string {
  return `fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.9.2
pandas==2.2.3
numpy==1.26.4
scikit-learn==1.5.2
joblib==1.4.2
python-multipart==0.0.12
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReqBody;
    if (!body.model || !body.dataset) {
      return NextResponse.json({ error: 'model and dataset required.' }, { status: 400 });
    }
    const apiKey = genApiKey();
    const endpoint = `/projects/${body.projectId}/models/${body.model.id}/predict`;
    const files = {
      'app.py': buildFastApiService(body.model, body.dataset),
      'Dockerfile': buildDockerfile(body.model),
      'docker-compose.yml': buildDockerCompose(body.model),
      'requirements.txt': buildRequirements(),
      'openapi.json': JSON.stringify({
        openapi: '3.0.0',
        info: { title: `AutoForge — ${body.model.name}`, version: '1.0.0' },
        paths: {
          '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
          '/predict': {
            post: {
              summary: 'Single prediction',
              security: [{ ApiKeyAuth: [] }],
            },
          },
          '/predict/batch': {
            post: {
              summary: 'Batch prediction',
              security: [{ ApiKeyAuth: [] }],
            },
          },
        },
        components: {
          securitySchemes: {
            ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
          },
        },
      }, null, 2),
    };

    return NextResponse.json({
      id: `dep_${Date.now().toString(36)}`,
      modelId: body.model.id,
      modelName: body.model.name,
      endpoint,
      apiKey,
      dockerImage: `autoforge/${body.model.id}:latest`,
      openApiUrl: `${endpoint}/docs`,
      status: 'deployed' as const,
      createdAt: Date.now(),
      files,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
