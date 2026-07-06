'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Server,
  Clock,
  Cpu,
  Zap,
  Database,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from 'recharts';
import { cn, makeRng } from '@/lib/utils';

export function MonitoringView() {
  const deployment = useStore((s) => s.deployment);
  const winner = useStore((s) => s.winner);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">MLOps</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Monitoring</h1>
        <p className="text-muted-foreground text-sm">Live inference analytics, drift detection, and resource utilization</p>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile
          icon={Activity}
          label="Requests (24h)"
          value="14.2K"
          trend="+12.4%"
          trendUp
        />
        <KpiTile
          icon={Clock}
          label="p99 latency"
          value="184ms"
          trend="-8ms"
          trendUp
        />
        <KpiTile
          icon={Cpu}
          label="Error rate"
          value="0.21%"
          trend="+0.04%"
        />
        <KpiTile
          icon={Zap}
          label="Throughput"
          value="128 rps"
          trend="+6 rps"
          trendUp
        />
      </div>

      {deployment ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{deployment.modelName}</div>
                <div className="text-xs text-muted-foreground truncate font-mono">{deployment.endpoint}</div>
              </div>
              <Badge variant="default" className="gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-foreground pulse-dot" />
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-sm text-muted-foreground flex items-center gap-3">
            <Server className="h-5 w-5 opacity-50" />
            No live deployment. Monitoring shows simulated metrics for demo purposes.
          </CardContent>
        </Card>
      )}


      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Inference latency (last 24h)</CardTitle>
            <Badge variant="outline" className="gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={generateLatencySeries()} margin={{ left: -10, right: 10, top: 5 }}>
              <defs>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} unit="ms" />
              <Tooltip
                contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, n: string) => [`${v.toFixed(1)}ms`, n]}
              />
              <Area type="monotone" dataKey="p50" stroke="var(--chart-2)" strokeWidth={2} fillOpacity={0} />
              <Area type="monotone" dataKey="p99" stroke="var(--chart-1)" fill="url(#latGrad)" strokeWidth={2} />
              <ReferenceLine y={200} stroke="var(--chart-5)" strokeDasharray="4 4" label={{ value: 'SLO (200ms)', fontSize: 10, fill: 'var(--chart-5)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Drift detection
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">PSI · KS-test</Badge>
          </div>
          <CardDescription>Population Stability Index per feature — values above 0.2 indicate significant drift</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={generateDriftData(winner)} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
              <XAxis dataKey="feature" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [v.toFixed(3), 'PSI']}
              />
              <ReferenceLine y={0.1} stroke="var(--chart-3)" strokeDasharray="4 4" label={{ value: 'low', fontSize: 9, fill: 'var(--chart-3)' }} />
              <ReferenceLine y={0.2} stroke="var(--chart-5)" strokeDasharray="4 4" label={{ value: 'significant', fontSize: 9, fill: 'var(--chart-5)' }} />
              <Bar dataKey="psi" radius={[4, 4, 0, 0]}>
                {generateDriftData(winner).map((d, i) => (
                  <Cell key={i} fill={d.psi > 0.2 ? 'var(--chart-5)' : d.psi > 0.1 ? 'var(--chart-3)' : 'var(--chart-1)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Prediction distribution</CardTitle>
            <CardDescription>Class balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={generatePredictionDist()} margin={{ left: -10, right: 10, top: 5 }} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, n: string) => [`${(v * 100).toFixed(1)}%`, n]}
                />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.5} />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Resource utilization</CardTitle>
            <CardDescription>CPU / GPU / memory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={generateLatencySeries().map((d) => ({ t: d.t, cpu: d.p50 * 0.4 + 30, mem: d.p99 * 0.3 + 40 }))} margin={{ left: -10, right: 10, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} unit="%" />
                <Tooltip
                  contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, n: string) => [`${v.toFixed(1)}%`, n.toUpperCase()]}
                />
                <Line type="monotone" dataKey="cpu" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mem" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Active alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <AlertRow severity="warning" title="PSI drift detected on 'fare'" desc="PSI=0.241 exceeds 0.2 threshold — last 24h" time="12m ago" />
          <AlertRow severity="info" title="Throughput spike" desc="Requests up 12.4% vs 7-day baseline" time="3h ago" />
          <AlertRow severity="ok" title="All systems nominal" desc="p99 latency within SLO (200ms)" time="just now" />
        </CardContent>
      </Card>
    </div>
  );
}

function generateLatencySeries() {
  const rng = makeRng(42);
  return Array.from({ length: 24 }, (_, i) => ({
    t: `-${23 - i}h`,
    p50: 60 + Math.sin(i * 0.5) * 20 + rng() * 15,
    p99: 150 + Math.sin(i * 0.4) * 40 + rng() * 30,
  }));
}

function generateDriftData(winner: ReturnType<typeof useStore.getState>['winner']) {
  const features = winner?.featureImportance?.slice(0, 8) ?? [
    { feature: 'feature_1', importance: 0.2 },
    { feature: 'feature_2', importance: 0.15 },
    { feature: 'feature_3', importance: 0.12 },
    { feature: 'feature_4', importance: 0.1 },
    { feature: 'feature_5', importance: 0.08 },
    { feature: 'feature_6', importance: 0.07 },
    { feature: 'feature_7', importance: 0.05 },
    { feature: 'feature_8', importance: 0.04 },
  ];
  const rng = makeRng(17);
  return features.map((f, i) => ({
    feature: f.feature.length > 12 ? f.feature.slice(0, 10) + '…' : f.feature,
    psi: +(rng() * 0.3 - (i > 4 ? 0.15 : 0)).toFixed(3),
  }));
}

function generatePredictionDist() {
  const rng = makeRng(99);
  return Array.from({ length: 24 }, (_, i) => {
    const pos = 0.55 + Math.sin(i * 0.3) * 0.1 + (rng() - 0.5) * 0.05;
    return { t: `-${23 - i}h`, positive: +pos.toFixed(3), negative: +(1 - pos).toFixed(3) };
  });
}

function KpiTile({ icon: Icon, label, value, trend, trendUp }: { icon: typeof Activity; label: string; value: string; trend: string; trendUp?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium tabular-nums',
            trendUp ? 'text-primary' : 'text-amber-500',
          )}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function AlertRow({ severity, title, desc, time }: { severity: 'warning' | 'info' | 'ok'; title: string; desc: string; time: string }) {
  const tone = severity === 'warning' ? 'border-amber-500/30 bg-amber-500/5' : severity === 'info' ? 'border-chart-2/30 bg-chart-2/5' : 'border-primary/30 bg-primary/5';
  const Icon = severity === 'warning' ? AlertTriangle : severity === 'info' ? Activity : TrendingUp;
  const color = severity === 'warning' ? 'text-amber-500' : severity === 'info' ? 'text-chart-2' : 'text-primary';
  return (
    <div className={cn('rounded-md border p-3 flex items-center gap-3', tone)}>
      <Icon className={cn('h-4 w-4 flex-shrink-0', color)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}
