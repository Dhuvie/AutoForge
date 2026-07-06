'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  UploadCloud,
  FileUp,
  Database,
  Cpu,
  Trophy,
  Rocket,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  HardDrive,
  Hash,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ParsedDataset } from '@/lib/types';
import { cn } from '@/lib/utils';

const SAMPLE_DATASETS: { key: string; name: string; desc: string; task: string; rows: string }[] = [
  { key: 'titanic', name: 'Titanic Survival', desc: 'Binary classification — predict survival from passenger features', task: 'binary classification', rows: '220 rows · 9 cols' },
  { key: 'house_prices', name: 'House Prices', desc: 'Regression — predict sale price from property features', task: 'regression', rows: '250 rows · 8 cols' },
  { key: 'customer_churn', name: 'Customer Churn', desc: 'Binary classification — predict telco customer churn', task: 'binary classification', rows: '300 rows · 10 cols' },
];

export function UploadView() {
  const { dataset, setDataset, setView, setProject, project } = useStore.getState();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const datasetState = useStore((s) => s.dataset);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({ title: 'Unsupported file', description: 'Please upload a .csv file.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setLoadingLabel('Uploading & profiling…');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/datasets/parse', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (HTTP ${res.status})`);
      }
      const data = (await res.json()) as ParsedDataset;
      setDataset(data);
      if (!project) {
        setProject({
          id: `proj_${Date.now().toString(36)}`,
          name: file.name.replace(/\.csv$/i, ''),
          createdAt: Date.now(),
        });
      }
      toast({ title: 'Dataset profiled', description: `${data.rows.length} rows · ${data.columns.length} columns · target: ${data.profile.targetCandidate ?? '—'}` });
    } catch (e) {
      toast({ title: 'Upload failed', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
      setLoadingLabel('');
    }
  }, [setDataset, project, setProject, toast]);

  const loadSample = useCallback(async (key: string) => {
    setLoading(true);
    setLoadingLabel('Generating sample dataset…');
    try {
      const fd = new FormData();
      fd.append('sample', key);
      const res = await fetch('/api/datasets/parse', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Failed (HTTP ${res.status})`);
      const data = (await res.json()) as ParsedDataset;
      setDataset(data);
      if (!project) {
        setProject({
          id: `proj_${Date.now().toString(36)}`,
          name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          createdAt: Date.now(),
        });
      }
      toast({ title: 'Sample loaded', description: `${data.rows.length} rows · target: ${data.profile.targetCandidate}` });
    } catch (e) {
      toast({ title: 'Failed to load sample', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
      setLoadingLabel('');
    }
  }, [setDataset, project, setProject, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  return (
    <div className="space-y-6">

      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/8 via-card to-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Step 1 — Ingest</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Bring your dataset</h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Drag-and-drop a CSV (max 5MB) or pick a sample. We&apos;ll auto-detect types, target, leakage, and statistical issues in milliseconds.
            </p>
          </div>
          {datasetState && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setView('eda')}>
                <Sparkles className="h-4 w-4 mr-2" />
                View EDA
              </Button>
              <Button onClick={() => setView('training')}>
                <Cpu className="h-4 w-4 mr-2" />
                Train Models
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-4">
          <Card
            className={cn(
              'border-2 border-dashed transition-all cursor-pointer',
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
            )}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[280px]">
              {loading ? (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <p className="font-medium">{loadingLabel}</p>
                  <p className="text-xs text-muted-foreground mt-1">Parsing, profiling, detecting target…</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <UploadCloud className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold text-base mb-1">Drop your CSV here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse — up to 5 MB</p>
                  <Button type="button" variant="default" size="sm" className="gap-2">
                    <FileUp className="h-3.5 w-3.5" />
                    Choose file
                  </Button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(f);
                      e.target.value = '';
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>


          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Or try with a sample dataset
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {SAMPLE_DATASETS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => loadSample(s.key)}
                  disabled={loading}
                  className="text-left rounded-lg border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  <div className="font-medium text-sm mb-1">{s.name}</div>
                  <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{s.desc}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{s.task}</Badge>
                    <span className="text-[10px] text-muted-foreground">{s.rows}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>


        <div className="space-y-4">
          {datasetState ? (
            <DatasetSummary dataset={datasetState} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
                Dataset summary will appear here once you upload.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                What we detect automatically
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {[
                'Column types & semantic roles (feature / target / id / drop)',
                'Target column + task type (regression / binary / multiclass)',
                'Missing values, duplicates, constant & quasi-constant features',
                'High-cardinality categoricals and text columns',
                'Skewed distributions and outlier candidates',
                'Highly correlated feature pairs (>0.85)',
                'Potential leakage columns',
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DatasetSummary({ dataset }: { dataset: ParsedDataset }) {
  const setView = useStore((s) => s.setView);
  const profile = dataset.profile;
  const targetCol = dataset.schema.find((c) => c.role === 'target');
  const features = dataset.schema.filter((c) => c.role === 'feature');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{dataset.filename ?? 'dataset.csv'}</CardTitle>
          <Badge variant="outline" className="text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Ready
          </Badge>
        </div>
        <CardDescription className="text-xs">Auto-profiled just now</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={Hash} label="Rows" value={profile.rowCount.toLocaleString()} />
          <Stat icon={Database} label="Columns" value={String(profile.colCount)} />
          <Stat icon={HardDrive} label="Memory" value={`${profile.memoryMb.toFixed(2)} MB`} />
          <Stat icon={Clock} label="Duplicates" value={String(profile.duplicateRows)} />
        </div>
        <div className="rounded-md bg-muted/40 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Detected target</div>
          {targetCol ? (
            <>
              <div className="font-medium text-sm">{targetCol.name}</div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="text-[10px]">{profile.taskType}</Badge>
                {profile.classificationSubtype && (
                  <Badge variant="outline" className="text-[10px]">{profile.classificationSubtype}</Badge>
                )}
                {profile.targetClasses && (
                  <span className="text-muted-foreground">{profile.targetClasses.length} classes</span>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground">None detected</div>
          )}
        </div>
        <div className="rounded-md bg-muted/40 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Features</div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Badge variant="outline">{features.filter((c) => c.type === 'numerical').length} numerical</Badge>
            <Badge variant="outline">{features.filter((c) => c.type === 'categorical').length} categorical</Badge>
            <Badge variant="outline">{features.filter((c) => c.type === 'boolean').length} boolean</Badge>
            <Badge variant="outline">{features.filter((c) => c.type === 'datetime').length} datetime</Badge>
          </div>
        </div>
        {(profile.constantColumns.length > 0 ||
          profile.quasiConstantColumns.length > 0 ||
          profile.correlatedPairs.length > 0 ||
          profile.skewedColumns.length > 0) && (
          <div className="rounded-md bg-amber-500/8 border border-amber-500/20 p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" /> Warnings ({profile.constantColumns.length + profile.quasiConstantColumns.length + profile.correlatedPairs.length + profile.skewedColumns.length})
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {profile.constantColumns.length > 0 && <li>· {profile.constantColumns.length} constant columns (will be dropped)</li>}
              {profile.quasiConstantColumns.length > 0 && <li>· {profile.quasiConstantColumns.length} quasi-constant</li>}
              {profile.correlatedPairs.length > 0 && <li>· {profile.correlatedPairs.length} highly-correlated pairs</li>}
              {profile.skewedColumns.length > 0 && <li>· {profile.skewedColumns.length} skewed distributions</li>}
            </ul>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => useStore.getState().setView('eda')}>
            View EDA
          </Button>
          <Button size="sm" className="flex-1 gap-1.5" onClick={() => useStore.getState().setView('training')}>
            <Cpu className="h-3.5 w-3.5" /> Train
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-semibold text-sm tabular-nums">{value}</div>
    </div>
  );
}
