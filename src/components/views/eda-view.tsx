'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Database,
  Hash,
  Type,
  ToggleLeft,
  Cpu,
  Sparkles,
  Table2,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ScatterChart,
  Scatter,
  Legend,
} from 'recharts';
import type { ColumnSchema, ParsedDataset } from '@/lib/types';
import { cn } from '@/lib/utils';

const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

const TYPE_ICON: Record<string, typeof Hash> = {
  numerical: Hash,
  categorical: Type,
  boolean: ToggleLeft,
  datetime: Calendar,
  text: Type,
  id: Hash,
  target: Sparkles,
};

export function EdaView() {
  const dataset = useStore((s) => s.dataset);
  const setView = useStore((s) => s.setView);

  if (!dataset) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Database className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No dataset loaded</p>
          <p className="text-sm">Upload a CSV to see automatic EDA.</p>
          <Button className="mt-4" onClick={() => setView('upload')}>
            Upload Dataset
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profile = dataset.profile;
  const numericalCols = dataset.schema.filter((c) => c.type === 'numerical');
  const categoricalCols = dataset.schema.filter((c) => c.type === 'categorical' || c.type === 'boolean');
  const targetCol = dataset.schema.find((c) => c.role === 'target');


  const typeCounts = dataset.schema.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {});
  const typePieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));


  const missingData = dataset.schema
    .filter((c) => c.missingPct > 0)
    .sort((a, b) => b.missingPct - a.missingPct)
    .slice(0, 10)
    .map((c) => ({ name: c.name, missing: +c.missingPct.toFixed(2) }));

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 2 — Profile</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Exploratory Data Analysis</h1>
          <p className="text-muted-foreground text-sm">Auto-generated profiling of {dataset.filename ?? 'your dataset'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setView('upload')}>Change dataset</Button>
          <Button onClick={() => setView('training')} className="gap-1.5">
            <Cpu className="h-4 w-4" />
            Start Training
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiCard icon={Hash} label="Rows" value={profile.rowCount.toLocaleString()} />
        <KpiCard icon={Database} label="Columns" value={String(profile.colCount)} />
        <KpiCard icon={BarChart3} label="Features" value={String(dataset.schema.filter((c) => c.role === 'feature').length)} />
        <KpiCard icon={Sparkles} label="Target" value={targetCol?.name ?? '—'} />
        <KpiCard
          icon={AlertTriangle}
          label="Warnings"
          value={String(profile.constantColumns.length + profile.quasiConstantColumns.length + profile.correlatedPairs.length + profile.skewedColumns.length)}
          tone={profile.constantColumns.length + profile.quasiConstantColumns.length + profile.correlatedPairs.length + profile.skewedColumns.length > 0 ? 'warning' : 'ok'}
        />
        <KpiCard icon={CheckCircle2} label="Memory" value={`${profile.memoryMb.toFixed(2)} MB`} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>


        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Column types</CardTitle>
                <CardDescription>Semantic distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={typePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {typePieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Missing values</CardTitle>
                <CardDescription>Top columns by missingness %</CardDescription>
              </CardHeader>
              <CardContent>
                {missingData.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                      No missing values detected
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={missingData} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={90} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v: number) => [`${v}%`, 'Missing']}
                      />
                      <Bar dataKey="missing" fill="var(--chart-5)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detected issues</CardTitle>
                <CardDescription>Auto-generated warnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <IssueRow label="Constant columns" count={profile.constantColumns.length} items={profile.constantColumns} tone="warn" />
                <IssueRow label="Quasi-constant" count={profile.quasiConstantColumns.length} items={profile.quasiConstantColumns} tone="warn" />
                <IssueRow label="High-cardinality cat" count={profile.highCardinalityColumns.length} items={profile.highCardinalityColumns} tone="info" />
                <IssueRow label="Skewed features" count={profile.skewedColumns.length} items={profile.skewedColumns} tone="warn" />
                <IssueRow label="Duplicate rows" count={profile.duplicateRows} items={[]} tone={profile.duplicateRows > 0 ? 'warn' : 'ok'} />
                <IssueRow label="Correlated pairs" count={profile.correlatedPairs.length} items={profile.correlatedPairs.map((p) => `${p.a}↔${p.b}`)} tone="info" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="columns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Column schema</CardTitle>
              <CardDescription>Inferred types, roles, and warnings for every column</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 px-3 font-semibold">Column</th>
                      <th className="py-2 px-3 font-semibold">Type</th>
                      <th className="py-2 px-3 font-semibold">Role</th>
                      <th className="py-2 px-3 font-semibold">Unique</th>
                      <th className="py-2 px-3 font-semibold">Missing</th>
                      <th className="py-2 px-3 font-semibold">Examples</th>
                      <th className="py-2 px-3 font-semibold">Warnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.schema.map((c) => {
                      const Icon = TYPE_ICON[c.type] ?? Hash;
                      return (
                        <tr key={c.name} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 font-medium">{c.name}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className="gap-1 text-[10px]">
                              <Icon className="h-3 w-3" />
                              {c.type}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant={c.role === 'target' ? 'default' : 'secondary'} className="text-[10px]">
                              {c.role}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 tabular-nums text-muted-foreground">{c.unique}</td>
                          <td className="py-2.5 px-3 tabular-nums">
                            {c.missingPct === 0 ? (
                              <span className="text-muted-foreground/60">—</span>
                            ) : (
                              <span className={c.missingPct > 40 ? 'text-amber-500' : 'text-foreground'}>
                                {c.missingPct.toFixed(1)}%
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[200px] truncate">
                            {c.examples.join(', ')}
                          </td>
                          <td className="py-2.5 px-3">
                            {c.warnings.length === 0 ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <span className="text-xs text-amber-500" title={c.warnings.join('\n')}>
                                {c.warnings.length}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="distributions" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {numericalCols.slice(0, 6).map((col) => (
              <HistogramCard key={col.name} col={col} dataset={dataset} />
            ))}
            {categoricalCols.slice(0, 6).map((col) => (
              <CategoryBarsCard key={col.name} col={col} />
            ))}
            {numericalCols.length === 0 && categoricalCols.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">No plottable columns found.</CardContent>
              </Card>
            )}
          </div>
        </TabsContent>


        <TabsContent value="correlations" className="space-y-4 mt-4">
          <CorrelationMatrix dataset={dataset} />
        </TabsContent>


        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                First {Math.min(dataset.head.length, 12)} rows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      {dataset.columns.map((c) => (
                        <th key={c} className="py-2 px-3 font-semibold whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.head.slice(0, 12).map((row, i) => (
                      <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
                        {dataset.columns.map((c) => (
                          <td key={c} className="py-2 px-3 whitespace-nowrap text-muted-foreground">
                            {row[c] === null || row[c] === '' ? (
                              <span className="text-amber-500/70 italic">NaN</span>
                            ) : String(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone = 'default' }: { icon: typeof Hash; label: string; value: string; tone?: 'default' | 'ok' | 'warning' }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className={cn('h-3 w-3', tone === 'warning' && 'text-amber-500', tone === 'ok' && 'text-primary')} />
        {label}
      </div>
      <div className="font-semibold text-lg tabular-nums truncate" title={value}>{value}</div>
    </div>
  );
}

function IssueRow({ label, count, items, tone }: { label: string; count: number; items: string[]; tone: 'ok' | 'warn' | 'info' }) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 min-w-0">
        {tone === 'ok' && <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
        {tone === 'warn' && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={cn('font-semibold tabular-nums', tone === 'warn' ? 'text-amber-500' : tone === 'ok' ? 'text-primary' : '')}>
          {count}
        </span>
        {count > 0 && items.length > 0 && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={items.join(', ')}>
            {items.slice(0, 2).join(', ')}{items.length > 2 ? '…' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function HistogramCard({ col, dataset }: { col: ColumnSchema; dataset: ParsedDataset }) {

  const nums = dataset.rows.map((r) => Number(r[col.name])).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const bins = 10;
  const binSize = (max - min) / bins || 1;
  const hist = Array.from({ length: bins }, (_, i) => ({
    bin: `${(min + i * binSize).toFixed(1)}`,
    count: nums.filter((n) => n >= min + i * binSize && (i === bins - 1 ? n <= min + (i + 1) * binSize : n < min + (i + 1) * binSize)).length,
  }));
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{col.name}</CardTitle>
          <Badge variant="outline" className="text-[10px]">numerical</Badge>
        </div>
        <CardDescription className="flex items-center gap-3 text-xs">
          <span>μ={col.mean?.toFixed(2)}</span>
          <span>σ={col.std?.toFixed(2)}</span>
          {col.skew !== undefined && (
            <span className={Math.abs(col.skew) > 2 ? 'text-amber-500' : ''}>skew={col.skew.toFixed(2)}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={hist} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
            <XAxis dataKey="bin" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} interval={1} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [v, 'Count']}
            />
            <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CategoryBarsCard({ col }: { col: ColumnSchema }) {
  const data = (col.topCategories ?? []).map((c) => ({ name: c.value, count: c.count, pct: +c.pct.toFixed(1) }));
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{col.name}</CardTitle>
          <Badge variant="outline" className="text-[10px]">{col.type}</Badge>
        </div>
        <CardDescription className="text-xs">
          {col.unique} unique · top {data.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={70} />
            <Tooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, _n, p) => [`${v} (${(p?.payload?.pct ?? 0)}%)`, 'Count']}
            />
            <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CorrelationMatrix({ dataset }: { dataset: ParsedDataset }) {
  const numericalCols = dataset.schema.filter((c) => c.type === 'numerical').map((c) => c.name);
  if (numericalCols.length < 2) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Need at least 2 numerical columns to compute correlations.
        </CardContent>
      </Card>
    );
  }
  const matrix = numericalCols.map((a) =>
    numericalCols.map((b) => {
      const pairs = dataset.rows.map((r) => [Number(r[a]), Number(r[b])]).filter((p) => !Number.isNaN(p[0]) && !Number.isNaN(p[1]));
      return pearson(pairs);
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Pearson correlation matrix
        </CardTitle>
        <CardDescription>{numericalCols.length} numerical features · values near ±1 indicate strong linear relationships</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="inline-block p-4 min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th></th>
                {numericalCols.map((c) => (
                  <th key={c} className="px-1.5 pb-2 text-[10px] text-muted-foreground font-medium" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 80 }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td className="pr-2 text-[10px] text-muted-foreground font-medium whitespace-nowrap text-right">
                    {numericalCols[i]}
                  </td>
                  {row.map((v, j) => {
                    const intensity = Math.abs(v);
                    const isPos = v >= 0;
                    return (
                      <td key={j} className="p-0.5">
                        <div
                          className="w-12 h-10 rounded flex items-center justify-center text-[10px] font-medium tabular-nums"
                          style={{
                            background: isPos
                              ? `color-mix(in oklch, var(--chart-1) ${intensity * 70}%, var(--card))`
                              : `color-mix(in oklch, var(--chart-5) ${intensity * 70}%, var(--card))`,
                            color: intensity > 0.6 ? 'var(--card)' : 'var(--foreground)',
                          }}
                          title={`${numericalCols[i]} ↔ ${numericalCols[j]}: ${v.toFixed(3)}`}
                        >
                          {v.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function pearson(pairs: number[][]): number {
  if (pairs.length < 3) return 0;
  const n = pairs.length;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let cov = 0, vx = 0, vy = 0;
  for (const [x, y] of pairs) {
    cov += (x - mx) * (y - my);
    vx += (x - mx) ** 2;
    vy += (y - my) ** 2;
  }
  if (vx === 0 || vy === 0) return 0;
  return cov / Math.sqrt(vx * vy);
}
