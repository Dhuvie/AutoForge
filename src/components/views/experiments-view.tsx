'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Activity,
  Layers,
  Cpu,
  GitBranch,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEMO_EXPERIMENTS = [
  { id: 'exp_demo1', name: 'titanic-baseline', status: 'completed', taskType: 'classification', startedAt: Date.now() - 3600_000, finishedAt: Date.now() - 3540_000, models: 18, bestScore: 0.8432, winner: 'LightGBM' },
  { id: 'exp_demo2', name: 'house-price-regression', status: 'completed', taskType: 'regression', startedAt: Date.now() - 7200_000, finishedAt: Date.now() - 7100_000, models: 14, bestScore: 0.8921, winner: 'XGBoost' },
  { id: 'exp_demo3', name: 'churn-prediction', status: 'completed', taskType: 'classification', startedAt: Date.now() - 86400_000, finishedAt: Date.now() - 86300_000, models: 22, bestScore: 0.8156, winner: 'Stacked Ensemble' },
  { id: 'exp_demo4', name: 'credit-risk-v2', status: 'failed', taskType: 'classification', startedAt: Date.now() - 172800_000, finishedAt: Date.now() - 172700_000, models: 4, bestScore: 0, winner: '—' },
  { id: 'exp_demo5', name: 'fraud-detection', status: 'completed', taskType: 'classification', startedAt: Date.now() - 259200_000, finishedAt: Date.now() - 259100_000, models: 21, bestScore: 0.9287, winner: 'CatBoost' },
];

export function ExperimentsView() {
  const experiment = useStore((s) => s.experiment);
  const models = useStore((s) => s.models);
  const winner = useStore((s) => s.winner);
  const setView = useStore((s) => s.setView);

  const allExperiments = experiment
    ? [{ id: experiment.id, name: experiment.name, status: experiment.status, taskType: experiment.taskType, startedAt: experiment.startedAt, finishedAt: experiment.finishedAt, models: models.length, bestScore: winner?.primaryScore ?? 0, winner: winner?.name ?? '—' }, ...DEMO_EXPERIMENTS]
    : DEMO_EXPERIMENTS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">MLOps</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="text-muted-foreground text-sm">Versioned experiment history with rollback and comparison</p>
        </div>
        <Button onClick={() => setView('training')} className="gap-1.5">
          <Cpu className="h-4 w-4" />
          New experiment
        </Button>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile label="Total experiments" value={String(allExperiments.length)} icon={FlaskConical} />
        <KpiTile label="Completed" value={String(allExperiments.filter((e) => e.status === 'completed').length)} icon={CheckCircle2} tone="ok" />
        <KpiTile label="Avg best score" value={(allExperiments.filter((e) => e.bestScore > 0).reduce((s, e) => s + e.bestScore, 0) / Math.max(1, allExperiments.filter((e) => e.bestScore > 0).length)).toFixed(4)} icon={Trophy} />
        <KpiTile label="Models trained" value={String(allExperiments.reduce((s, e) => s + e.models, 0))} icon={Layers} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Experiment history
          </CardTitle>
          <CardDescription>All training runs across this workspace</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 px-3">Experiment</th>
                  <th className="py-2 px-3">Task</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Models</th>
                  <th className="py-2 px-3 text-right">Best score</th>
                  <th className="py-2 px-3">Winner</th>
                  <th className="py-2 px-3">Started</th>
                  <th className="py-2 px-3 text-right">Duration</th>
                </tr>
              </thead>
              <tbody>
                {allExperiments.map((e) => {
                  const duration = e.finishedAt ? (e.finishedAt - e.startedAt) / 1000 : 0;
                  return (
                    <tr key={e.id} className="border-b border-border/40 hover:bg-muted/30 cursor-pointer">
                      <td className="py-2.5 px-3 font-medium">
                        <div className="flex items-center gap-2">
                          {e.id === experiment?.id && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />}
                          {e.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">{e.id}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px]">{e.taskType}</Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        {e.status === 'completed' ? (
                          <Badge variant="default" className="gap-1 text-[10px]"><CheckCircle2 className="h-3 w-3" /> completed</Badge>
                        ) : e.status === 'failed' ? (
                          <Badge variant="destructive" className="text-[10px]">failed</Badge>
                        ) : e.status === 'running' ? (
                          <Badge variant="secondary" className="gap-1 text-[10px]"><Activity className="h-3 w-3 animate-pulse" /> running</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">{e.status}</Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{e.models}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                        {e.bestScore > 0 ? e.bestScore.toFixed(4) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-xs">{e.winner}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">
                        {formatRelativeTime(e.startedAt)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-xs text-muted-foreground">
                        {duration > 0 ? `${duration.toFixed(0)}s` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Model registry
            </CardTitle>
            <Button size="sm" variant="ghost" className="text-xs">View all</Button>
          </div>
          <CardDescription>Versioned, staged models with promote/archive/rollback</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 px-3">Model</th>
                <th className="py-2 px-3">Version</th>
                <th className="py-2 px-3">Stage</th>
                <th className="py-2 px-3 text-right">Score</th>
                <th className="py-2 px-3">Registered</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_REGISTRY.map((m, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-medium">{m.name}</td>
                  <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">v{m.version}</td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant={m.stage === 'Production' ? 'default' : m.stage === 'Staging' ? 'secondary' : 'outline'}
                      className="text-[10px]"
                    >
                      {m.stage}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{m.score.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatRelativeTime(m.registered)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs">Promote</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs">Archive</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

const MODEL_REGISTRY = [
  { name: 'LightGBM', version: '1.4.2', stage: 'Production', score: 0.8432, registered: Date.now() - 3600_000 },
  { name: 'Stacked Ensemble', version: '1.0.0', stage: 'Staging', score: 0.8511, registered: Date.now() - 1800_000 },
  { name: 'XGBoost', version: '2.1.0', stage: 'Archived', score: 0.8398, registered: Date.now() - 7200_000 },
  { name: 'CatBoost', version: '1.2.0', stage: 'Archived', score: 0.8376, registered: Date.now() - 86400_000 },
];

function KpiTile({ label, value, icon: Icon, tone = 'default' }: { label: string; value: string; icon: typeof FlaskConical; tone?: 'default' | 'ok' }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className={cn('h-3 w-3', tone === 'ok' && 'text-primary')} />
        {label}
      </div>
      <div className="font-semibold text-lg tabular-nums">{value}</div>
    </div>
  );
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
