'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  Rocket,
  FileText,
  Crown,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';
import type { ModelResult } from '@/lib/types';
import { cn } from '@/lib/utils';

const FAMILY_COLOR: Record<string, string> = {
  tree: 'var(--chart-1)',
  ensemble: 'var(--chart-2)',
  linear: 'var(--chart-3)',
  neighbor: 'var(--chart-4)',
  neural: 'var(--chart-5)',
  naive_bayes: 'var(--chart-1)',
  svm: 'var(--chart-2)',
};

export function LeaderboardView() {
  const models = useStore((s) => s.models);
  const dataset = useStore((s) => s.dataset);
  const setView = useStore((s) => s.setView);

  if (models.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No models trained yet</p>
          <p className="text-sm">Run the training pipeline to populate the leaderboard.</p>
          <Button className="mt-4" onClick={() => setView('training')}>Start Training</Button>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...models].sort((a, b) => b.primaryScore - a.primaryScore);
  const completed = sorted.filter((m) => m.status === 'completed');
  const winner = completed[0];
  const taskType = winner?.taskType ?? dataset?.profile.taskType ?? 'classification';


  const barData = completed.slice(0, 10).map((m) => ({
    name: m.name.length > 20 ? m.name.slice(0, 18) + '…' : m.name,
    fullName: m.name,
    score: +m.primaryScore.toFixed(4),
    family: m.family,
    fill: FAMILY_COLOR[m.family],
  }));


  const scatterData = completed.map((m) => ({
    name: m.name,
    x: m.trainTimeMs / 1000,
    y: m.primaryScore,
    family: m.family,
    fill: FAMILY_COLOR[m.family],
  }));


  const familyMap: Record<string, { sum: number; count: number }> = {};
  completed.forEach((m) => {
    familyMap[m.family] = familyMap[m.family] ?? { sum: 0, count: 0 };
    familyMap[m.family].sum += m.primaryScore;
    familyMap[m.family].count += 1;
  });
  const familyData = Object.entries(familyMap).map(([name, v]) => ({
    name,
    avg: +(v.sum / v.count).toFixed(4),
    count: v.count,
    fill: FAMILY_COLOR[name],
  }));

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 4 — Compare</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Model Leaderboard</h1>
          <p className="text-muted-foreground text-sm">{completed.length} models ranked by {taskType === 'classification' ? 'accuracy' : 'R²'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setView('training')}>Back to training</Button>
          <Button onClick={() => setView('explain')} className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Explainability <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>


      {winner && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/8 via-card to-card overflow-hidden relative">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Best model</div>
                  <div className="text-xl font-bold">{winner.name}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="default">{winner.family}</Badge>
                    {winner.isEnsemble && <Badge variant="outline"><Layers className="h-3 w-3 mr-1" />ensemble</Badge>}
                    <span className="text-xs text-muted-foreground">trained in {(winner.trainTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{taskType === 'classification' ? 'Accuracy' : 'R²'}</div>
                  <div className="text-2xl font-bold tabular-nums text-primary">{winner.primaryScore.toFixed(4)}</div>
                </div>
                {taskType === 'classification' ? (
                  <>
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">F1</div>
                      <div className="text-2xl font-bold tabular-nums">{winner.metrics.f1?.toFixed(4)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">ROC-AUC</div>
                      <div className="text-2xl font-bold tabular-nums">{winner.metrics.rocAuc?.toFixed(4)}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">RMSE</div>
                      <div className="text-2xl font-bold tabular-nums">{winner.metrics.rmse?.toFixed(4)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">MAE</div>
                      <div className="text-2xl font-bold tabular-nums">{winner.metrics.mae?.toFixed(4)}</div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => setView('explain')} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Explain
                </Button>
                <Button size="sm" variant="outline" onClick={() => setView('deploy')} className="gap-1.5">
                  <Rocket className="h-3.5 w-3.5" /> Deploy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top 10 by primary metric</CardTitle>
            <CardDescription>Higher is better</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} layout="vertical" margin={{ left: 30, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={false} />
                <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={120} />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v, 'Score']}
                  labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ''}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Train time vs score</CardTitle>
            <CardDescription>Find the Pareto frontier — fast AND accurate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Train time (s)"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  label={{ value: 'Train time (s)', position: 'bottom', fontSize: 11, fill: 'var(--muted-foreground)', offset: 0 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Score"
                  domain={[0.5, 1]}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, n: string) => [v.toFixed(4), n === 'x' ? 'Train (s)' : 'Score']}
                  labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ''}
                />
                <Scatter data={scatterData} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance by model family</CardTitle>
          <CardDescription>Average score across all trained models in each family</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={familyData} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, _n, p) => [`${v} (n=${p?.payload?.count})`, 'Avg score']}
              />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {familyData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All models</CardTitle>
          <CardDescription>{completed.length} trained models · sorted by primary metric</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 px-3 w-10">Rank</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Family</th>
                  <th className="py-2 px-3 text-right">{taskType === 'classification' ? 'Accuracy' : 'R²'}</th>
                  <th className="py-2 px-3 text-right">{taskType === 'classification' ? 'F1' : 'RMSE'}</th>
                  <th className="py-2 px-3 text-right">CV σ</th>
                  <th className="py-2 px-3 text-right">Time</th>
                  <th className="py-2 px-3">Key hyperparameters</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((m, i) => (
                  <tr key={m.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold',
                        i === 0 ? 'bg-amber-500/20 text-amber-500' : i === 1 ? 'bg-slate-400/20 text-slate-400' : i === 2 ? 'bg-orange-700/20 text-orange-700' : 'text-muted-foreground',
                      )}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <div className="flex items-center gap-2">
                        {m.isEnsemble && <Layers className="h-3.5 w-3.5 text-primary" />}
                        {m.name}
                        {i === 0 && <Crown className="h-3 w-3 text-amber-500" />}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: FAMILY_COLOR[m.family] }} />
                      <span className="text-xs text-muted-foreground">{m.family}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-medium">{m.primaryScore.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">{m.secondaryScore.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground text-xs">±{m.cvStd.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground text-xs">{(m.trainTimeMs / 1000).toFixed(1)}s</td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(m.params).slice(0, 3).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[9px] font-mono">
                            {k}={String(v).length > 12 ? String(v).slice(0, 10) + '…' : String(v)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

