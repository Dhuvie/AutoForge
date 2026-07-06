'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Eye,
  FileCode2,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Sparkles,
  Rocket,
  Database,
  Cpu,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ReportsView() {
  const dataset = useStore((s) => s.dataset);
  const models = useStore((s) => s.models);
  const winner = useStore((s) => s.winner);
  const experiment = useStore((s) => s.experiment);
  const deployment = useStore((s) => s.deployment);
  const project = useStore((s) => s.project);
  const setView = useStore((s) => s.setView);
  const { toast } = useToast();

  const [activeReport, setActiveReport] = useState<'pdf' | 'markdown'>('pdf');

  const reportMarkdown = useMemo(() => {
    if (!dataset) return '# No dataset loaded\n\nUpload a dataset to generate a report.';
    const completed = models.filter((m) => m.status === 'completed');
    const sorted = [...completed].sort((a, b) => b.primaryScore - a.primaryScore);
    return `# AutoForge — Experiment Report

**Project:** ${project?.name ?? 'Untitled'}
**Dataset:** ${dataset.filename ?? 'dataset.csv'}
**Generated:** ${new Date().toISOString()}

## 1. Executive Summary

This report documents an automated machine learning experiment conducted on the **${dataset.filename ?? 'dataset'}** dataset using AutoForge. The dataset contains **${dataset.rows.length.toLocaleString()} rows** across **${dataset.columns.length} columns**, with **${dataset.schema.filter((c) => c.role === 'feature').length} features** and target column **${dataset.profile.targetCandidate ?? '—'}**.

${winner ? `The winning model was **${winner.name}** with a ${winner.taskType === 'classification' ? 'accuracy' : 'R²'} of **${winner.primaryScore.toFixed(4)}**${winner.isEnsemble ? ' (auto-ensemble)' : ''}.` : 'No winning model was selected.'}

${completed.length > 0 ? `${completed.length} models were trained and evaluated using ${experiment?.config.cvFolds ?? 5}-fold cross-validation${experiment?.config.enableHpo ? ' with Optuna Bayesian hyperparameter optimization' : ''}.` : ''}

## 2. Dataset Profile

- **Rows:** ${dataset.rows.length.toLocaleString()}
- **Columns:** ${dataset.columns.length}
- **Memory footprint:** ${dataset.profile.memoryMb.toFixed(2)} MB
- **Duplicate rows:** ${dataset.profile.duplicateRows}
- **Total missing cells:** ${dataset.profile.missingTotal}
- **Constant columns:** ${dataset.profile.constantColumns.length} ${dataset.profile.constantColumns.length > 0 ? `(${dataset.profile.constantColumns.join(', ')})` : ''}
- **Quasi-constant columns:** ${dataset.profile.quasiConstantColumns.length}
- **Skewed features:** ${dataset.profile.skewedColumns.length} ${dataset.profile.skewedColumns.length > 0 ? `(${dataset.profile.skewedColumns.slice(0, 5).join(', ')}${dataset.profile.skewedColumns.length > 5 ? '…' : ''})` : ''}
- **Highly correlated pairs (>0.85):** ${dataset.profile.correlatedPairs.length}

### Task detection
- **Detected target:** ${dataset.profile.targetCandidate ?? '—'}
- **Task type:** ${dataset.profile.taskType ?? '—'}${dataset.profile.classificationSubtype ? ` (${dataset.profile.classificationSubtype})` : ''}
${dataset.profile.targetClasses ? `- **Target classes:** ${dataset.profile.targetClasses.join(', ')}` : ''}

## 3. Top 5 Models

| Rank | Model | Family | ${winner?.taskType === 'classification' ? 'Accuracy' : 'R²'} | CV σ | Train time |
|------|-------|--------|${winner?.taskType === 'classification' ? '----------' : '----'}|------|------------|
${sorted.slice(0, 5).map((m, i) => `| ${i + 1} | ${m.name} | ${m.family} | ${m.primaryScore.toFixed(4)} | ±${m.cvStd.toFixed(4)} | ${(m.trainTimeMs / 1000).toFixed(1)}s |`).join('\n')}

## 4. Winning Model Details

${winner ? `**Algorithm:** ${winner.name}
**Family:** ${winner.family}
**Primary score:** ${winner.primaryScore.toFixed(4)}
**Secondary score:** ${winner.secondaryScore.toFixed(4)}
**Cross-validation std:** ±${winner.cvStd.toFixed(4)}
**Training time:** ${(winner.trainTimeMs / 1000).toFixed(2)}s

### Hyperparameters
${Object.entries(winner.params).map(([k, v]) => `- **${k}**: ${String(v)}`).join('\n')}

### Metrics
${Object.entries(winner.metrics).map(([k, v]) => `- **${k}**: ${v?.toFixed(4) ?? '—'}`).join('\n')}
` : 'No winning model.'}

## 5. Explainability Summary

${winner?.featureImportance ? `Top 5 features by SHAP importance:

${winner.featureImportance.slice(0, 5).map((f, i) => `${i + 1}. **${f.feature}** — ${(f.importance * 100).toFixed(1)}%`).join('\n')}

The top 3 features account for **${(((winner.featureImportance[0]?.importance ?? 0) + (winner.featureImportance[1]?.importance ?? 0) + (winner.featureImportance[2]?.importance ?? 0)) * 100).toFixed(1)}%** of total attribution. We recommend monitoring these features for drift in production.
` : 'No explainability data available.'}

## 6. Deployment

${deployment ? `The winning model was packaged as a Dockerized FastAPI service.

- **Endpoint:** ${deployment.endpoint}
- **Docker image:** ${deployment.dockerImage}
- **API key:** \`${deployment.apiKey}\`
- **OpenAPI docs:** ${deployment.openApiUrl}
- **Generated files:** ${Object.keys(deployment.files).join(', ')}

To run locally:
\`\`\`bash
docker run -p 8000:8000 -e AUTOFORGE_API_KEY=${deployment.apiKey} ${deployment.dockerImage}
\`\`\`
` : 'No deployment was generated for this experiment.'}

## 7. Recommendations

1. **Monitor top features** in production for data drift, especially \`${winner?.featureImportance?.[0]?.feature ?? '—'}\`.
2. **Re-train periodically** as new data becomes available — recommend weekly cadence.
3. **Set up alerts** for prediction drift (PSI > 0.2) and latency degradation (>200ms p99).
4. **Consider collecting** additional samples for under-represented segments to improve robustness.
5. **Document model limitations** in your model card and ensure human-in-the-loop review for high-stakes decisions.

---

*Report generated by AutoForge v1.0.0*
`;
  }, [dataset, models, winner, experiment, deployment, project]);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Report downloaded', description: filename });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 7 — Report</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm">Auto-generated, downloadable experiment documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => downloadFile(reportMarkdown, `${project?.name ?? 'experiment'}-report.md`, 'text/markdown')}
            disabled={!dataset}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            Markdown
          </Button>
          <Button
            onClick={() => downloadFile(reportMarkdown, `${project?.name ?? 'experiment'}-report.txt`, 'text/plain')}
            disabled={!dataset}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            Download report
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Experiment report — preview
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {reportMarkdown.split('\n').length} lines · {reportMarkdown.length.toLocaleString()} chars
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-[12px] font-mono bg-zinc-950 dark:bg-black/40 text-zinc-200 dark:text-zinc-300 p-4 rounded-md overflow-x-auto max-h-[600px] leading-relaxed whitespace-pre-wrap">
                {reportMarkdown}
              </pre>
            </CardContent>
          </Card>
        </div>


        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Report contents</CardTitle>
              <CardDescription>Auto-generated sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <SectionRow icon={Sparkles} title="Executive Summary" desc="Key findings" />
              <SectionRow icon={Database} title="Dataset Profile" desc="Schema, types, missingness" />
              <SectionRow icon={Trophy} title="Top 5 Models" desc="Ranked leaderboard" />
              <SectionRow icon={Cpu} title="Winning Model" desc="Full hyperparameter dump" />
              <SectionRow icon={Sparkles} title="Explainability" desc="SHAP, PDP summary" />
              <SectionRow icon={Rocket} title="Deployment" desc="Docker + API docs" />
              <SectionRow icon={CheckCircle2} title="Recommendations" desc="Actionable next steps" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Export formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ExportRow
                icon={FileText}
                title="Markdown"
                desc="For GitHub, Notion, Slack"
                onClick={() => downloadFile(reportMarkdown, `${project?.name ?? 'experiment'}-report.md`, 'text/markdown')}
                disabled={!dataset}
              />
              <ExportRow
                icon={FileCode2}
                title="Plain text"
                desc="Universal, lightweight"
                onClick={() => downloadFile(reportMarkdown, `${project?.name ?? 'experiment'}-report.txt`, 'text/plain')}
                disabled={!dataset}
              />
              <ExportRow
                icon={FileText}
                title="HTML"
                desc="Browser-renderable"
                onClick={() => {
                  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${project?.name ?? 'experiment'} report</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222}h1{color:#10b981}h2{border-bottom:1px solid #ddd;padding-bottom:4px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:6px}pre{background:#f4f4f4;padding:12px;border-radius:6px;overflow-x:auto}</style>
</head><body>${markdownToHtml(reportMarkdown)}</body></html>`;
                  downloadFile(html, `${project?.name ?? 'experiment'}-report.html`, 'text/html');
                }}
                disabled={!dataset}
              />
            </CardContent>
          </Card>

          {!dataset && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Upload a dataset and run training to generate a report.
                <Button size="sm" className="mt-3" onClick={() => setView('upload')}>
                  Upload dataset <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionRow({ icon: Icon, title, desc }: { icon: typeof FileText; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/30">
      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
    </div>
  );
}

function ExportRow({ icon: Icon, title, desc, onClick, disabled }: { icon: typeof FileText; title: string; desc: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 p-2.5 rounded-md border border-border/40 text-left transition-colors',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary/40 hover:bg-muted/30',
      )}
    >
      <Icon className="h-4 w-4 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Download className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

function markdownToHtml(md: string): string {

  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/```[\s\S]+?```/g, (m) => `<pre>${m.replace(/```/g, '')}</pre>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hl])/gm, (line) => line);
}
