


import { NextRequest, NextResponse } from 'next/server';
import { buildEnsemble, planTrainingRun, computeFeatureImportance, computeConfusionMatrix, computePredictions } from '@/lib/ml-engine';
import type { ParsedDataset, TrainConfig } from '@/lib/types';

export const runtime = 'nodejs';

interface ReqBody {
  dataset: ParsedDataset;
  config: TrainConfig;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReqBody;
    if (!body.dataset || !body.config) {
      return NextResponse.json({ error: 'dataset and config are required.' }, { status: 400 });
    }

    const base = planTrainingRun(body.dataset, body.config);
    let models = base;

    if (body.config.enableEnsemble && base.length >= 3) {
      const ens = buildEnsemble(base.slice(0, 3), body.dataset);
      models = [ens, ...base];
    }



    const decorated = models.map((m, idx) => {
      if (idx > 3) return m;
      const fi = computeFeatureImportance(body.dataset, m.name);
      const cm = m.taskType === 'classification' ? computeConfusionMatrix(body.dataset, m.primaryScore) : undefined;
      const preds = computePredictions(body.dataset, m.primaryScore);
      return { ...m, featureImportance: fi, confusionMatrix: cm, predictions: preds };
    });


    const sorted = [...decorated].sort((a, b) => b.primaryScore - a.primaryScore);
    const winner = sorted[0];
    const withWinner = decorated.map((m) => ({ ...m, isWinner: m.id === winner.id }));

    return NextResponse.json({
      models: withWinner,
      winner: { ...winner, isWinner: true },
      stats: {
        total: withWinner.length,
        estTotalTimeMs: withWinner.reduce((s, m) => s + m.trainTimeMs, 0),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
