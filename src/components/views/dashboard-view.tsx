'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Cpu,
  Database,
  Trophy,
  Rocket,
  Activity,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  Layers,
  Server,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { cn, makeRng } from '@/lib/utils';

export function DashboardView() {
  const project = useStore((s) => s.project);
  const dataset = useStore((s) => s.dataset);
  const models = useStore((s) => s.models);
  const experiment = useStore((s) => s.experiment);
  const deployment = useStore((s) => s.deployment);
  const winner = useStore((s) => s.winner);
  const setView = useStore((s) => s.setView);

  const completedModels = models.filter((m) => m.status === 'completed');

  const steps = [
    { key: 'upload', label: 'Upload', icon: UploadCloud, done: !!dataset, active: !dataset, view: 'upload' as const },
    { key: 'eda', label: 'EDA', icon: Database, done: !!dataset, active: !!dataset && models.length === 0, view: 'eda' as const },
    { key: 'train', label: 'Train', icon: Cpu, done: models.length > 0, active: !!dataset && models.length === 0, view: 'training' as const },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy, done: !!winner, active: models.length > 0 && !winner, view: 'leaderboard' as const },
    { key: 'explain', label: 'Explain', icon: Sparkles, done: !!winner, active: !!winner && !deployment, view: 'explain' as const },
    { key: 'deploy', label: 'Deploy', icon: Rocket, done: !!deployment, active: !!winner && !deployment, view: 'deploy' as const },
  ];

  return (
    <div className="space-y-6">

      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/8 via-card to-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              {project ? `Welcome back — ${project.name}` : 'Welcome to AutoForge AI'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              {dataset
                ? `Dataset: ${dataset.filename ?? '—'} · ${dataset.rows.length} rows · ${models.length} models trained`
                : 'Upload a CSV or pick a sample to forge your first model in under a minute.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setView('upload')} className="gap-1.5">
              <UploadCloud className="h-4 w-4" />
              New dataset
            </Button>
            <Button onClick={() => setView(dataset ? 'training' : 'upload')} className="gap-1.5">
              {dataset ? <><Cpu className="h-4 w-4" /> Train models</> : <><ArrowRight className="h-4 w-4" /> Get started</>}
            </Button>
          </div>
        </div>
      </div>


      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pipeline progress</CardTitle>
          <CardDescription>Six stages from CSV to production</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.key}
                  onClick={() => setView(step.view)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all relative',
                    step.done
                      ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                      : step.active
                        ? 'border-primary/40 bg-card hover:border-primary/60'
                        : 'border-border/60 bg-muted/30 opacity-60',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      'h-8 w-8 rounded-md flex items-center justify-center',
                      step.done ? 'bg-primary/15 text-primary' : step.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {step.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : step.active ? (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium">{step.label}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Database}
          label="Datasets"
          value={dataset ? '1' : '0'}
          sub={dataset ? `${dataset.rows.length} rows` : 'no dataset yet'}
          tone={dataset ? 'ok' : 'default'}
        />
        <KpiCard
          icon={Cpu}
          label="Models trained"
          value={String(completedModels.length)}
          sub={models.length > 0 ? `of ${models.length} planned` : 'none yet'}
          tone={completedModels.length > 0 ? 'ok' : 'default'}
        />
        <KpiCard
          icon={Trophy}
          label="Best score"
          value={winner ? winner.primaryScore.toFixed(4) : '—'}
          sub={winner ? winner.name : 'no winner yet'}
          tone={winner ? 'ok' : 'default'}
        />
        <KpiCard
          icon={Rocket}
          label="Deployments"
          value={deployment ? '1' : '0'}
          sub={deployment ? deployment.modelName : 'not deployed'}
          tone={deployment ? 'ok' : 'default'}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Latest experiment</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setView('experiments')} className="gap-1 text-xs">
                All experiments <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {experiment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{experiment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(experiment.startedAt).toLocaleString()} · {experiment.config.cvFolds}-fold CV · {experiment.config.timeBudgetSec}s budget
                    </div>
                  </div>
                  <Badge variant={experiment.status === 'completed' ? 'default' : 'secondary'} className="gap-1.5">
                    {experiment.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                    {experiment.status === 'running' && <Clock className="h-3 w-3" />}
                    {experiment.status}
                  </Badge>
                </div>
                {experiment.results && (
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label="Models trained" value={String(experiment.results.totalModels)} />
                    <Stat label="Best score" value={experiment.results.bestScore.toFixed(4)} />
                    <Stat label="Winner" value={experiment.results.winner} small />
                  </div>
                )}

                {completedModels.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Top 5 model scores</div>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={[...completedModels].sort((a, b) => b.primaryScore - a.primaryScore).slice(0, 5).map((m) => ({ name: m.name.split(' ').slice(0, 2).join(' '), score: +m.primaryScore.toFixed(4), isWinner: m.isWinner }))} margin={{ left: -20, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                        <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                        <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {completedModels.slice(0, 5).map((m, i) => (
                            <Cell key={i} fill={m.isWinner ? 'var(--primary)' : 'var(--chart-2)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                <Cpu className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No experiments yet. Start training to see live results here.
              </div>
            )}
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ActionRow icon={UploadCloud} label="Upload new dataset" desc="CSV or sample" onClick={() => setView('upload')} />
            <ActionRow icon={Cpu} label="Start training" desc="24-model AutoML" onClick={() => setView('training')} disabled={!dataset} />
            <ActionRow icon={Sparkles} label="View explainability" desc="SHAP, PDP, fairness" onClick={() => setView('explain')} disabled={!winner} />
            <ActionRow icon={Rocket} label="Deploy model" desc="FastAPI + Docker" onClick={() => setView('deploy')} disabled={!winner} />
            <ActionRow icon={Activity} label="Open monitoring" desc="Drift + latency" onClick={() => setView('monitoring')} />
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Cluster resource utilization</CardTitle>
            <Badge variant="outline" className="gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              Live
            </Badge>
          </div>
          <CardDescription>Simulated training-worker telemetry</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={generateTimeSeries()} margin={{ left: -10, right: 10, top: 5 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} unit="%" />
              <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: number, n: string) => [`${v.toFixed(1)}%`, n.toUpperCase()]} />
              <Area type="monotone" dataKey="cpu" stroke="var(--chart-1)" fill="url(#cpuGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="gpu" stroke="var(--chart-2)" fill="url(#gpuGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <MiniStat icon={TrendingUp} label="CPU avg" value="64.3%" />
            <MiniStat icon={Zap} label="GPU avg" value="42.1%" />
            <MiniStat icon={Layers} label="Parallel workers" value="4" />
            <MiniStat icon={Server} label="Throughput" value="128 req/s" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateTimeSeries() {
  const rng = makeRng(42);
  return Array.from({ length: 24 }, (_, i) => ({
    t: `-${23 - i}m`,
    cpu: 40 + Math.sin(i * 0.4) * 15 + rng() * 10,
    gpu: 20 + Math.cos(i * 0.3) * 20 + rng() * 8,
  }));
}

function KpiCard({ icon: Icon, label, value, sub, tone }: { icon: typeof Cpu; label: string; value: string; sub: string; tone: 'ok' | 'default' }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          'h-8 w-8 rounded-md flex items-center justify-center',
          tone === 'ok' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{label}</div>
      <div className="text-xs text-muted-foreground truncate mt-1" title={sub}>{sub}</div>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-md bg-muted/40 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn('font-semibold tabular-nums truncate', small ? 'text-xs' : 'text-base')} title={value}>{value}</div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, desc, onClick, disabled }: { icon: typeof Cpu; label: string; desc: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/40',
      )}
    >
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-semibold text-sm tabular-nums">{value}</div>
    </div>
  );
}
