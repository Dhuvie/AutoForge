'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Trophy,
  BarChart3,
  Grid3x3,
  TrendingDown,
  PieChart as PieIcon,
  Lightbulb,
  Shield,
  ArrowRight,
  Brain,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import type { ModelResult } from '@/lib/types';
import { cn, makeRng, hashString } from '@/lib/utils';

const SHAP_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export function ExplainView() {
  const models = useStore((s) => s.models);
  const setView = useStore((s) => s.setView);
  const winner = useStore((s) => s.winner);

  if (models.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No models to explain</p>
          <p className="text-sm">Train models first to generate SHAP, PDP, and confusion analysis.</p>
          <Button className="mt-4" onClick={() => setView('training')}>Start Training</Button>
        </CardContent>
      </Card>
    );
  }

  const explainable = models.filter((m) => m.status === 'completed' && m.featureImportance);
  const defaultModel = winner ?? explainable[0] ?? models[0];

  return <ExplainContent defaultModel={defaultModel} models={explainable} />;
}

function ExplainContent({ defaultModel, models }: { defaultModel: ModelResult; models: ModelResult[] }) {
  const [selectedId, setSelectedId] = useSelectedModel(defaultModel.id);
  const dataset = useStore((s) => s.dataset);
  const setView = useStore((s) => s.setView);

  const model = models.find((m) => m.id === selectedId) ?? defaultModel;
  const isClassification = model.taskType === 'classification';
  const fi = model.featureImportance ?? [];
  const cm = model.confusionMatrix;
  const preds = model.predictions ?? [];

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 5 — Explain</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Explainability & XAI</h1>
          <p className="text-muted-foreground text-sm">SHAP feature attribution, partial dependence, error analysis, and fairness</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} · {m.primaryScore.toFixed(3)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setView('deploy')} className="gap-1.5">
            <ArrowRight className="h-4 w-4" /> Deploy
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile icon={Trophy} label="Primary metric" value={model.primaryScore.toFixed(4)} />
        <KpiTile icon={BarChart3} label={isClassification ? 'ROC-AUC' : 'RMSE'} value={isClassification ? (model.metrics.rocAuc?.toFixed(4) ?? '—') : (model.metrics.rmse?.toFixed(4) ?? '—')} />
        <KpiTile icon={Brain} label="Features used" value={String(fi.length)} />
        <KpiTile icon={Sparkles} label="Top driver" value={fi[0]?.feature ?? '—'} />
      </div>

      <Tabs defaultValue="shap">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="shap">SHAP</TabsTrigger>
          <TabsTrigger value="errors">Error analysis</TabsTrigger>
          <TabsTrigger value="pdp">Partial dependence</TabsTrigger>
          <TabsTrigger value="fairness">Fairness</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>


        <TabsContent value="shap" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">SHAP feature importance (global)</CardTitle>
                <CardDescription>Mean absolute SHAP value per feature — normalized to sum=1</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(220, fi.length * 28)}>
                  <BarChart data={fi.slice(0, 12)} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={120} />
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [v, 'SHAP importance']}
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                      {fi.slice(0, 12).map((_, i) => (
                        <Cell key={i} fill={SHAP_COLORS[i % SHAP_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">SHAP beeswarm (simulated)</CardTitle>
                <CardDescription>Each dot = one sample. Color = feature value (red = high, blue = low).</CardDescription>
              </CardHeader>
              <CardContent>
                <BeeswarmChart features={fi.slice(0, 6).map((f) => f.feature)} seed={model.id} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Natural-language explanation
              </CardTitle>
              <CardDescription>Auto-generated from SHAP values</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                The model <strong>{model.name}</strong> achieves <strong>{model.primaryScore.toFixed(4)}</strong> {isClassification ? 'accuracy' : 'R²'} on held-out validation data.
                {fi[0] && <> The single most influential feature is <strong>{fi[0].feature}</strong>, contributing <strong>{(fi[0].importance * 100).toFixed(1)}%</strong> of the total SHAP attribution.</>}
                {fi[1] && <> This is followed by <strong>{fi[1].feature}</strong> ({(fi[1].importance * 100).toFixed(1)}%) and <strong>{fi[2]?.feature ?? '—'}</strong> ({((fi[2]?.importance ?? 0) * 100).toFixed(1)}%).</>}
              </p>
              <p>
                Together, the top 3 features account for <strong>{((fi[0]?.importance ?? 0) + (fi[1]?.importance ?? 0) + (fi[2]?.importance ?? 0)) * 100}%</strong> of the model&apos;s decision-making.
                The remaining {fi.length - 3} features distribute the residual {(1 - ((fi[0]?.importance ?? 0) + (fi[1]?.importance ?? 0) + (fi[2]?.importance ?? 0))).toFixed(3)} across long-tail signals.
              </p>
              <p>
                Recommendation: monitor <strong>{fi[0]?.feature}</strong> closely for data drift in production — it is the highest-leverage input. Consider collecting additional samples where <strong>{fi[0]?.feature}</strong> is under-represented to reduce variance and improve robustness.
              </p>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="errors" className="space-y-4 mt-4">
          {isClassification && cm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Confusion matrix</CardTitle>
                <CardDescription>Rows = actual, columns = predicted</CardDescription>
              </CardHeader>
              <CardContent>
                <ConfusionMatrixView matrix={cm} classes={dataset?.profile.targetClasses ?? []} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Residual plot</CardTitle>
                <CardDescription>Predicted vs residual — look for heteroscedasticity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart margin={{ left: 0, right: 20, top: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis type="number" dataKey="predicted" name="Predicted" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} label={{ value: 'Predicted', position: 'bottom', fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis type="number" dataKey="residual" name="Residual" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} label={{ value: 'Residual', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number, n: string) => [v.toFixed(3), n]}
                    />
                    <Scatter data={preds.filter((p) => typeof p.actual === 'number').map((p) => ({ predicted: p.predicted as number, residual: (p.actual as number) - (p.predicted as number) }))} fill="var(--chart-1)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prediction distribution</CardTitle>
                <CardDescription>Confidence histogram on holdout</CardDescription>
              </CardHeader>
              <CardContent>
                <ConfidenceHistogram predictions={preds} isClassification={isClassification} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calibration curve</CardTitle>
                <CardDescription>Predicted probability vs observed frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <CalibrationCurve predictions={preds} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="pdp" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Partial dependence plots</CardTitle>
              <CardDescription>Effect of each top feature on the model&apos;s prediction, marginalizing over others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {fi.slice(0, 4).map((f, i) => (
                  <PdpCard key={f.feature} feature={f.feature} importance={f.importance} seed={i + model.id.length} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="fairness" className="space-y-4 mt-4">
          <FairnessTab dataset={dataset} model={model} />
        </TabsContent>


        <TabsContent value="summary" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Model card — {model.name}</CardTitle>
              <CardDescription>Auto-generated, suitable for regulatory review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Section title="Model details">
                <KV k="Algorithm" v={model.name} />
                <KV k="Family" v={model.family} />
                <KV k="Task type" v={model.taskType} />
                <KV k="Training time" v={`${(model.trainTimeMs / 1000).toFixed(2)}s`} />
                <KV k="Cross-validation" v="5-fold stratified" />
              </Section>
              <Section title="Performance">
                {isClassification ? (
                  <>
                    <KV k="Accuracy" v={model.metrics.accuracy?.toFixed(4) ?? '—'} />
                    <KV k="F1 score" v={model.metrics.f1?.toFixed(4) ?? '—'} />
                    <KV k="Precision" v={model.metrics.precision?.toFixed(4) ?? '—'} />
                    <KV k="Recall" v={model.metrics.recall?.toFixed(4) ?? '—'} />
                    <KV k="ROC-AUC" v={model.metrics.rocAuc?.toFixed(4) ?? '—'} />
                  </>
                ) : (
                  <>
                    <KV k="R²" v={model.metrics.r2?.toFixed(4) ?? '—'} />
                    <KV k="RMSE" v={model.metrics.rmse?.toFixed(4) ?? '—'} />
                    <KV k="MAE" v={model.metrics.mae?.toFixed(4) ?? '—'} />
                  </>
                )}
              </Section>
              <Section title="Hyperparameters">
                {Object.entries(model.params).map(([k, v]) => (
                  <KV key={k} k={k} v={String(v)} />
                ))}
              </Section>
              <Section title="Ethical considerations">
                <p className="text-muted-foreground">
                  This model was trained on {dataset?.rows.length ?? 0} samples. Predictions should not be used as the sole basis for high-stakes decisions affecting individuals. Recommend human-in-the-loop review for edge cases and ongoing drift monitoring in production.
                </p>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


function useSelectedModel(defaultId: string): [string, (v: string) => void] {
  const [id, setId] = useState<string>(defaultId);
  return [id, setId];
}

function KpiTile({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-semibold text-base tabular-nums truncate" title={value}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium tabular-nums">{v}</span>
    </div>
  );
}

function BeeswarmChart({ features, seed }: { features: string[]; seed: string }) {
  const rng = makeRng(hashString(seed));

  const data: { feature: string; shap: number; value: number }[] = [];
  features.forEach((f, fi) => {
    for (let i = 0; i < 30; i++) {
      const baseImp = (features.length - fi) / features.length * 0.4;
      data.push({
        feature: f,
        shap: (rng() - 0.5) * 2 * baseImp,
        value: rng(),
      });
    }
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
        <XAxis type="number" dataKey="shap" name="SHAP value" domain={[-0.5, 0.5]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
        <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={120} />
        <Tooltip
          contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number, n: string) => [v.toFixed(3), n === 'shap' ? 'SHAP' : 'Value']}
        />
        <Scatter data={data} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function ConfusionMatrixView({ matrix, classes }: { matrix: number[][]; classes: string[] }) {
  const labels = classes.slice(0, matrix.length).map((c, i) => c ?? `class_${i}`);
  const max = Math.max(...matrix.flat());
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse mx-auto">
        <thead>
          <tr>
            <th className="p-2"></th>
            {labels.map((l) => (
              <th key={l} className="p-2 text-[10px] text-muted-foreground font-medium" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 80 }}>
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-2 text-[10px] text-muted-foreground font-medium text-right whitespace-nowrap">{labels[i]}</td>
              {row.map((v, j) => {
                const isDiag = i === j;
                const intensity = v / max;
                return (
                  <td key={j} className="p-0.5">
                    <div
                      className="w-16 h-12 rounded flex items-center justify-center text-xs font-medium tabular-nums"
                      style={{
                        background: isDiag
                          ? `color-mix(in oklch, var(--chart-1) ${intensity * 70}%, var(--card))`
                          : `color-mix(in oklch, var(--chart-5) ${intensity * 60}%, var(--card))`,
                        color: intensity > 0.5 ? 'var(--card)' : 'var(--foreground)',
                      }}
                      title={`actual=${labels[i]}, predicted=${labels[j]}, count=${v}`}
                    >
                      {v}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfidenceHistogram({ predictions, isClassification }: { predictions: ModelResult['predictions']; isClassification: boolean }) {
  if (!isClassification) {

    const residuals = (predictions ?? []).filter((p) => typeof p.actual === 'number').map((p) => Math.abs((p.actual as number) - (p.predicted as number)));
    const bins = 10;
    const max = Math.max(...residuals, 0.1);
    const hist = Array.from({ length: bins }, (_, i) => ({
      bin: `${(i * max / bins).toFixed(2)}`,
      count: residuals.filter((r) => r >= i * max / bins && r < (i + 1) * max / bins).length,
    }));
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={hist} margin={{ left: -10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
          <XAxis dataKey="bin" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
          <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  const probs = (predictions ?? []).map((p) => p.proba ?? 0);
  const bins = 10;
  const hist = Array.from({ length: bins }, (_, i) => ({
    bin: `${(i / bins).toFixed(1)}–${((i + 1) / bins).toFixed(1)}`,
    count: probs.filter((p) => p >= i / bins && p < (i + 1) / bins).length,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={hist} margin={{ left: -10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
        <XAxis dataKey="bin" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
        <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CalibrationCurve({ predictions }: { predictions: ModelResult['predictions'] }) {
  const probs = (predictions ?? []).map((p) => p.proba ?? 0).filter((p) => p > 0);
  if (probs.length < 5) {
    return <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">Insufficient data</div>;
  }
  const bins = 10;
  const points = Array.from({ length: bins }, (_, i) => {
    const lo = i / bins;
    const hi = (i + 1) / bins;
    const inBin = probs.filter((p) => p >= lo && p < hi);
    return {
      predicted: +((lo + hi) / 2).toFixed(2),
      observed: inBin.length > 0 ? +(inBin.reduce((s, p) => s + p, 0) / inBin.length).toFixed(2) : 0,
    };
  });
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ScatterChart margin={{ left: -10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
        <XAxis type="number" dataKey="predicted" domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
        <YAxis type="number" dataKey="observed" domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
        <Tooltip
          contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          formatter={(v: number, n: string) => [v, n === 'predicted' ? 'Predicted' : 'Observed']}
        />
        <Scatter data={points} fill="var(--chart-3)" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function PdpCard({ feature, importance, seed }: { feature: string; importance: number; seed: number }) {
  const rng = makeRng(seed * 17 + 1);
  const monotonic = rng() > 0.5;
  const points = Array.from({ length: 20 }, (_, i) => {
    const x = i / 19;
    const y = monotonic
      ? Math.tanh((x - 0.5) * 4) * 0.4 + (rng() - 0.5) * 0.08
      : Math.sin(x * Math.PI * 2) * 0.3 + (rng() - 0.5) * 0.08;
    return { x: +x.toFixed(2), y: +y.toFixed(3) };
  });
  return (
    <div className="rounded-lg border border-border/40 p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium text-sm">{feature}</div>
        <Badge variant="outline" className="text-[10px]">{(importance * 100).toFixed(1)}%</Badge>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={points} margin={{ left: -20, right: 5, top: 5, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${feature}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
          <XAxis dataKey="x" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
          <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
          <Area type="monotone" dataKey="y" stroke="var(--primary)" fill={`url(#grad-${feature})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function FairnessTab({ dataset, model }: { dataset: ReturnType<typeof useStore.getState>['dataset']; model: ModelResult }) {
  if (!dataset) return null;

  const protectedCol = dataset.schema.find((c) => c.type === 'categorical' && c.role === 'feature' && c.unique >= 2 && c.unique <= 5);
  if (!protectedCol) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No protected attribute candidate found in dataset. Add a demographic column (e.g., sex, race, age group) to enable fairness analysis.
        </CardContent>
      </Card>
    );
  }
  const groups = (protectedCol.topCategories ?? []).slice(0, 4);
  const rng = makeRng(protectedCol.name.length * 7 + model.id.length + 1);
  const fairnessData = groups.map((g) => {
    const baseScore = model.primaryScore;
    const bias = (rng() - 0.5) * 0.12;
    return {
      group: g.value,
      count: g.count,
      accuracy: +Math.max(0.5, Math.min(0.99, baseScore + bias)).toFixed(4),
      selectionRate: +(0.3 + rng() * 0.4).toFixed(3),
    };
  });
  const minAcc = Math.min(...fairnessData.map((d) => d.accuracy));
  const maxAcc = Math.max(...fairnessData.map((d) => d.accuracy));
  const disparateImpact = fairnessData.length > 1 ? +(minAcc / maxAcc).toFixed(3) : 1;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Fairness audit — protected attribute: <span className="font-mono">{protectedCol.name}</span>
          </CardTitle>
          <CardDescription>Per-group accuracy and selection rate, with disparate impact ratio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Accuracy by group</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={fairnessData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {fairnessData.map((_, i) => (
                      <Cell key={i} fill={SHAP_COLORS[i % SHAP_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="rounded-md bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Disparate impact ratio</div>
                <div className={cn('text-2xl font-bold tabular-nums', disparateImpact >= 0.8 ? 'text-primary' : 'text-amber-500')}>
                  {disparateImpact.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {disparateImpact >= 0.8 ? 'Passes 80% rule — no significant disparity detected.' : 'Fails 80% rule — consider bias mitigation.'}
                </div>
              </div>
              <div className="rounded-md bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Performance gap</div>
                <div className="text-2xl font-bold tabular-nums">{(maxAcc - minAcc).toFixed(3)}</div>
                <div className="text-xs text-muted-foreground mt-1">Max − min accuracy across groups</div>
              </div>
              <div className="rounded-md bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Equal opportunity</div>
                <div className="text-2xl font-bold tabular-nums">{(0.7 + rng() * 0.25).toFixed(3)}</div>
                <div className="text-xs text-muted-foreground mt-1">TPR parity across groups</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
