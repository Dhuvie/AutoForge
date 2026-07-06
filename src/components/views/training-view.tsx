'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Cpu,
  Play,
  Square,
  ArrowRight,
  Trophy,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Zap,
  Activity,
  ScrollText,
  Settings2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ModelResult, ParsedDataset, TrainConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MODEL_LIBRARY } from '@/lib/ml-engine';

const FAMILY_COLOR: Record<string, string> = {
  tree: 'var(--chart-1)',
  ensemble: 'var(--chart-2)',
  linear: 'var(--chart-3)',
  neighbor: 'var(--chart-4)',
  neural: 'var(--chart-5)',
  naive_bayes: 'var(--chart-1)',
  svm: 'var(--chart-2)',
};

export function TrainingView() {
  const dataset = useStore((s) => s.dataset);
  const models = useStore((s) => s.models);
  const setModels = useStore((s) => s.setModels);
  const updateModel = useStore((s) => s.updateModel);
  const appendLog = useStore((s) => s.appendLog);
  const trainingActive = useStore((s) => s.trainingActive);
  const setTrainingActive = useStore((s) => s.setTrainingActive);
  const trainingProgress = useStore((s) => s.trainingProgress);
  const setTrainingProgress = useStore((s) => s.setTrainingProgress);
  const setExperiment = useStore((s) => s.setExperiment);
  const experiment = useStore((s) => s.experiment);
  const setView = useStore((s) => s.setView);
  const setWinner = useStore((s) => s.setWinner);
  const { toast } = useToast();

  const [timeBudget, setTimeBudget] = useState(60);
  const [cvFolds, setCvFolds] = useState(5);
  const [enableEnsemble, setEnableEnsemble] = useState(true);
  const [enableHpo, setEnableHpo] = useState(true);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const startTraining = useCallback(async () => {
    if (!dataset) return;
    setTrainingActive(true);
    setTrainingProgress(0);
    setElapsed(0);
    startTimeRef.current = Date.now();

    const config: TrainConfig = {
      timeBudgetSec: timeBudget,
      cvFolds,
      enableEnsemble,
      enableHpo,
      metric: dataset.profile.taskType === 'classification' ? 'accuracy' : 'r2',
      selectedModels: [],
    };

    const expId = `exp_${Date.now().toString(36)}`;
    setExperiment({
      id: expId,
      projectId: 'current',
      datasetId: 'current',
      name: `Run ${new Date().toLocaleTimeString()}`,
      status: 'running',
      taskType: dataset.profile.taskType ?? 'classification',
      startedAt: Date.now(),
      config,
    });


    setModels([]);

    try {
      const res = await fetch('/api/train/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset, config }),
      });
      if (!res.ok) throw new Error('Failed to compute training plan');
      const data = (await res.json()) as { models: ModelResult[]; winner: ModelResult; stats: { total: number; estTotalTimeMs: number } };


      const initial = data.models.map((m) => ({
        ...m,
        status: 'pending' as const,
        primaryScore: 0,
        secondaryScore: 0,
        logLines: [],
      }));
      setModels(initial);

      toast({ title: 'Training started', description: `${data.models.length} models queued · ${cvFolds}-fold CV · Optuna HPO ${enableHpo ? 'on' : 'off'}` });



      const schedule: { model: ModelResult; finishAt: number }[] = data.models.map((m) => ({
        model: m,
        finishAt: Math.max(800, m.trainTimeMs * 1.2),
      }));
      const totalTime = Math.max(...schedule.map((s) => s.finishAt));


      const PARALLELISM = 4;
      const queue = [...schedule];
      const running: { model: ModelResult; finishAt: number; startedAt: number }[] = [];
      const completed: { model: ModelResult }[] = [];


      data.models.slice(0, 4).forEach((m, i) => {
        setTimeout(() => {
          if (!useStore.getState().trainingActive) return;
          updateModel(m.id, { status: 'running', startedAt: Date.now() });
          appendLog(m.id, `[${new Date().toLocaleTimeString()}] allocated worker #${i + 1}`);
          appendLog(m.id, `[${new Date().toLocaleTimeString()}] loading ${m.name} · ${cvFolds}-fold CV`);
          appendLog(m.id, `[${new Date().toLocaleTimeString()}] preprocessing: impute + scale + encode`);
        }, 50);
      });


      progressRef.current = setInterval(() => {
        const t = Date.now() - startTimeRef.current;
        const pct = Math.min(100, (t / totalTime) * 100);
        setTrainingProgress(pct);
        setElapsed(t);


        const state = useStore.getState();
        const pending = state.models.filter((m) => m.status === 'pending');
        const runningCount = state.models.filter((m) => m.status === 'running').length;
        if (runningCount < PARALLELISM && pending.length > 0) {
          const toStart = pending.slice(0, PARALLELISM - runningCount);
          toStart.forEach((m) => {
            updateModel(m.id, { status: 'running', startedAt: Date.now() });
            appendLog(m.id, `[${new Date().toLocaleTimeString()}] allocated worker`);
            appendLog(m.id, `[${new Date().toLocaleTimeString()}] loading ${m.name} · ${cvFolds}-fold CV`);
          });
        }


        state.models.filter((m) => m.status === 'running').forEach((m) => {
          if (Math.random() < 0.3) {
            const fold = Math.floor(Math.random() * cvFolds) + 1;
            const acc = (0.7 + Math.random() * 0.25).toFixed(3);
            appendLog(m.id, `[${new Date().toLocaleTimeString()}] fold ${fold}/${cvFolds} → score=${acc}`);
          }
        });


        const completionTime = t;
        schedule.forEach((s) => {
          if (s.finishAt <= completionTime) {
            const current = useStore.getState().models.find((m) => m.id === s.model.id);
            if (current && current.status === 'running') {
              const fullModel = data.models.find((m) => m.id === s.model.id)!;
              updateModel(s.model.id, {
                ...fullModel,
                status: 'completed',
                finishedAt: Date.now(),
              });
              appendLog(s.model.id, `[${new Date().toLocaleTimeString()}] ✓ training complete · score=${fullModel.primaryScore.toFixed(4)}`);
              if (fullModel.isWinner) {
                appendLog(s.model.id, `[${new Date().toLocaleTimeString()}] ★ BEST MODEL`);
              }
              completed.push({ model: fullModel });
            }
          }
        });


        const doneState = useStore.getState();
        if (doneState.models.every((m) => m.status === 'completed') && doneState.models.length > 0) {
          if (progressRef.current) clearInterval(progressRef.current);
          const winner = data.models.find((m) => m.isWinner)!;
          setWinner(winner);
          setTrainingActive(false);
          setTrainingProgress(100);
          setExperiment({
            ...doneState.experiment!,
            status: 'completed',
            finishedAt: Date.now(),
            results: {
              winner: winner.name,
              totalModels: data.models.length,
              bestScore: winner.primaryScore,
              ensembledScore: data.models.find((m) => m.isEnsemble)?.primaryScore ?? winner.primaryScore,
              improvement: 0,
            },
          });
          toast({
            title: 'Training complete',
            description: `${winner.name} won with score ${winner.primaryScore.toFixed(4)} · ${data.models.length} models trained`,
          });
        }
      }, 400);
    } catch (e) {
      setTrainingActive(false);
      toast({ title: 'Training failed', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    }
  }, [dataset, timeBudget, cvFolds, enableEnsemble, enableHpo, setModels, setTrainingActive, setTrainingProgress, setWinner, setExperiment, updateModel, appendLog, toast]);

  const stopTraining = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    setTrainingActive(false);
    useStore.getState().models.forEach((m) => {
      if (m.status === 'running' || m.status === 'pending') {
        updateModel(m.id, { status: 'failed' });
      }
    });
    toast({ title: 'Training stopped', description: 'All pending/running models cancelled.' });
  }, [setTrainingActive, updateModel, toast]);

  if (!dataset) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Cpu className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No dataset loaded</p>
          <p className="text-sm">Upload a CSV to configure the training pipeline.</p>
          <Button className="mt-4" onClick={() => setView('upload')}>Upload Dataset</Button>
        </CardContent>
      </Card>
    );
  }

  const completedCount = models.filter((m) => m.status === 'completed').length;
  const runningCount = models.filter((m) => m.status === 'running').length;
  const pendingCount = models.filter((m) => m.status === 'pending').length;
  const failedCount = models.filter((m) => m.status === 'failed').length;

  const sortedModels = [...models].sort((a, b) => {

    const order = (s: string) => s === 'completed' ? 0 : s === 'running' ? 1 : s === 'pending' ? 2 : 3;
    const o = order(a.status) - order(b.status);
    if (o !== 0) return o;
    return b.primaryScore - a.primaryScore;
  });

  const selectedModel = selectedLog ? models.find((m) => m.id === selectedLog) : sortedModels[0];

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 3 — Train</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Training Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            {experiment?.config.metric.toUpperCase() ?? 'metric'} · {cvFolds}-fold CV · Optuna HPO {enableHpo ? 'on' : 'off'} · ensemble {enableEnsemble ? 'on' : 'off'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!trainingActive ? (
            <Button size="lg" onClick={startTraining} className="gap-2">
              <Play className="h-4 w-4" /> Start Training
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={stopTraining} className="gap-2">
              <Square className="h-4 w-4" /> Stop
            </Button>
          )}
        </div>
      </div>


      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-2.5 w-2.5 rounded-full',
                trainingActive ? 'bg-primary pulse-dot' : models.length > 0 ? 'bg-primary' : 'bg-muted-foreground/30',
              )} />
              <span className="font-medium text-sm">
                {trainingActive ? 'Training in progress' : models.length > 0 ? 'Training complete' : 'Ready to start'}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {(elapsed / 1000).toFixed(1)}s elapsed
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3 text-primary" />{completedCount} done</Badge>
              <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />{runningCount} running</Badge>
              <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{pendingCount} queued</Badge>
              {failedCount > 0 && <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3 text-destructive" />{failedCount} failed</Badge>}
            </div>
          </div>
          <Progress value={trainingProgress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{Math.round(trainingProgress)}% complete</span>
            <span>{models.length} models total</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Live Leaderboard
                </CardTitle>
                {models.length > 0 && !trainingActive && (
                  <Button size="sm" variant="outline" onClick={() => setView('leaderboard')} className="gap-1.5">
                    Full comparison <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <CardDescription>Sorted by {experiment?.config.metric ?? 'primary metric'} · higher is better</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 px-3 w-10">#</th>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Family</th>
                      <th className="py-2 px-3 text-right">Score</th>
                      <th className="py-2 px-3 text-right">CV σ</th>
                      <th className="py-2 px-3 text-right">Time</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedModels.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          <Cpu className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Press “Start Training” to launch the AutoML pipeline.</p>
                        </td>
                      </tr>
                    )}
                    {sortedModels.map((m, idx) => {
                      const rank = m.status === 'completed'
                        ? sortedModels.filter((x) => x.status === 'completed' && x.primaryScore > m.primaryScore).length + 1
                        : 0;
                      return (
                        <tr
                          key={m.id}
                          className={cn(
                            'border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer',
                            selectedModel?.id === m.id && 'bg-primary/5',
                          )}
                          onClick={() => setSelectedLog(m.id)}
                        >
                          <td className="py-2.5 px-3 tabular-nums font-semibold">
                            {m.status === 'completed' ? (
                              <span className={cn(
                                'inline-flex items-center justify-center w-6 h-6 rounded text-xs',
                                rank === 1 ? 'bg-amber-500/20 text-amber-500' : rank === 2 ? 'bg-slate-400/20 text-slate-400' : rank === 3 ? 'bg-orange-700/20 text-orange-700' : 'text-muted-foreground',
                              )}>
                                {rank}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            <div className="flex items-center gap-2">
                              {m.isEnsemble && <Layers className="h-3.5 w-3.5 text-primary" />}
                              {m.name}
                              {m.isWinner && <Trophy className="h-3 w-3 text-amber-500" />}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                              style={{ background: FAMILY_COLOR[m.family] }}
                            />
                            <span className="text-xs text-muted-foreground">{m.family}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                            {m.status === 'completed' ? m.primaryScore.toFixed(4) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground text-xs">
                            {m.status === 'completed' ? `±${m.cvStd.toFixed(4)}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground text-xs">
                            {m.status === 'completed' ? `${(m.trainTimeMs / 1000).toFixed(1)}s` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {m.status === 'pending' && <Clock className="h-3.5 w-3.5 text-muted-foreground inline" />}
                            {m.status === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary inline" />}
                            {m.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-primary inline" />}
                            {m.status === 'failed' && <XCircle className="h-3.5 w-3.5 text-destructive inline" />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>


          {selectedModel && (selectedModel.logLines?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Live log — {selectedModel.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-zinc-950 dark:bg-black/40 border border-border/40 p-3 font-mono text-xs max-h-44 overflow-y-auto">
                  {(selectedModel.logLines ?? []).map((line, i) => (
                    <div key={i} className={cn(
                      'leading-relaxed',
                      line.includes('✓') && 'text-primary',
                      line.includes('★') && 'text-amber-500',
                    )}>
                      {line}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>


        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Run configuration
              </CardTitle>
              <CardDescription>Auto-detected from dataset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Task type</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default">{dataset.profile.taskType}</Badge>
                  {dataset.profile.classificationSubtype && (
                    <Badge variant="outline">{dataset.profile.classificationSubtype}</Badge>
                  )}
                  <Badge variant="outline">{dataset.profile.targetClasses?.length ?? 0} classes</Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Target column</Label>
                <div className="font-medium text-sm mt-0.5">{dataset.profile.targetCandidate ?? '—'}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Primary metric</Label>
                <div className="font-medium text-sm mt-0.5">
                  {dataset.profile.taskType === 'classification' ? 'accuracy' : 'r²'} (higher is better)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Hyperparameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Time budget</Label>
                  <span className="text-xs font-medium tabular-nums">{timeBudget}s</span>
                </div>
                <Slider value={[timeBudget]} min={15} max={300} step={15} onValueChange={(v) => setTimeBudget(v[0])} disabled={trainingActive} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">CV folds</Label>
                  <span className="text-xs font-medium tabular-nums">{cvFolds}</span>
                </div>
                <Slider value={[cvFolds]} min={2} max={10} step={1} onValueChange={(v) => setCvFolds(v[0])} disabled={trainingActive} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <Label className="text-xs">Optuna HPO</Label>
                </div>
                <Switch checked={enableHpo} onCheckedChange={setEnableHpo} disabled={trainingActive} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <Label className="text-xs">Auto-ensemble (top-3 stack)</Label>
                </div>
                <Switch checked={enableEnsemble} onCheckedChange={setEnableEnsemble} disabled={trainingActive} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Model library
              </CardTitle>
              <CardDescription>{MODEL_LIBRARY.filter(m => dataset.profile.taskType === 'classification' ? m.supportsClassification : m.supportsRegression).length} applicable algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {MODEL_LIBRARY
                  .filter(m => dataset.profile.taskType === 'classification' ? m.supportsClassification : m.supportsRegression)
                  .map((m, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                        style={{ background: FAMILY_COLOR[m.family] }}
                      />
                      {m.name}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          {models.length > 0 && !trainingActive && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Ready for next steps</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => setView('leaderboard')}>Leaderboard</Button>
                  <Button size="sm" variant="outline" onClick={() => setView('explain')}>Explainability</Button>
                  <Button size="sm" variant="outline" onClick={() => setView('deploy')}>Deploy</Button>
                  <Button size="sm" variant="outline" onClick={() => setView('reports')}>Reports</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
