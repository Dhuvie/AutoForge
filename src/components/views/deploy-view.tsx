'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Rocket,
  Copy,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Terminal,
  FileCode,
  Package,
  Server,
  Activity,
  Code2,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { DeploymentInfo } from '@/lib/types';
import { cn } from '@/lib/utils';

export function DeployView() {
  const models = useStore((s) => s.models);
  const dataset = useStore((s) => s.dataset);
  const setDeployment = useStore((s) => s.setDeployment);
  const deployment = useStore((s) => s.deployment);
  const project = useStore((s) => s.project);
  const winner = useStore((s) => s.winner);
  const setView = useStore((s) => s.setView);
  const { toast } = useToast();

  const [deploying, setDeploying] = useState(false);
  const [activeFile, setActiveFile] = useState<string>('app.py');

  const deployableModel = winner ?? models.find((m) => m.status === 'completed');

  const deploy = useCallback(async () => {
    if (!deployableModel || !dataset || !project) return;
    setDeploying(true);
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: deployableModel, dataset, projectId: project.id }),
      });
      if (!res.ok) throw new Error(`Deploy failed (HTTP ${res.status})`);
      const info = (await res.json()) as DeploymentInfo;
      setDeployment(info);
      toast({ title: 'Deployment ready', description: `Endpoint live at ${info.endpoint}` });
    } catch (e) {
      toast({ title: 'Deploy failed', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setDeploying(false);
    }
  }, [deployableModel, dataset, project, setDeployment, toast]);

  if (!deployableModel) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Rocket className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No model to deploy</p>
          <p className="text-sm">Train models first to enable 1-click deployment.</p>
          <Button className="mt-4" onClick={() => setView('training')}>Start Training</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 6 — Deploy</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Deployment</h1>
          <p className="text-muted-foreground text-sm">Generate FastAPI service + Dockerfile + API key for the winning model</p>
        </div>
        {!deployment && (
          <Button size="lg" onClick={deploy} disabled={deploying} className="gap-2">
            {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {deploying ? 'Packaging…' : 'Deploy Now'}
          </Button>
        )}
      </div>


      <div className="grid md:grid-cols-3 gap-3">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Deploying model</div>
                <div className="font-semibold truncate">{deployableModel.name}</div>
                <div className="text-xs text-muted-foreground">
                  {deployableModel.family} · score {deployableModel.primaryScore.toFixed(4)} · {(deployableModel.trainTimeMs / 1000).toFixed(1)}s train
                </div>
              </div>
              <Badge variant="outline">{deployableModel.taskType}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</div>
            {deployment ? (
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary pulse-dot" />
                <span className="font-semibold text-primary">Live</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(deployment.createdAt).toLocaleTimeString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="font-semibold text-muted-foreground">Not deployed</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {deployment && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Inference endpoint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Endpoint URL" value={deployment.endpoint} mono copyable />
                <Field label="API key" value={deployment.apiKey} mono copyable />
                <Field label="Docker image" value={deployment.dockerImage} mono />
                <Field label="Swagger UI" value={deployment.openApiUrl} mono />
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Terminal className="h-3.5 w-3.5" /> Test request
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setView('monitoring')}>
                    <Activity className="h-3.5 w-3.5" /> Monitor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Quick start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-[11px] font-mono bg-zinc-950 dark:bg-black/40 text-zinc-200 dark:text-zinc-300 p-3 rounded-md overflow-x-auto leading-relaxed">
{`# 1. Run the container
docker run -d \\
  -p 8000:8000 \\
  -e AUTOFORGE_API_KEY=${deployment.apiKey} \\
  ${deployment.dockerImage}

# 2. Health check
curl http://localhost:8000/health

# 3. Predict
curl -X POST http://localhost:8000/predict \\
  -H "X-API-Key: ${deployment.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"feature_1": 1.5, "feature_2": "cat"}'`}
                </pre>
              </CardContent>
            </Card>
          </div>


          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Generated deployment package
              </CardTitle>
              <CardDescription>Auto-generated source files — drop into any container runtime</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFile} onValueChange={setActiveFile}>
                <TabsList className="mb-3">
                  {Object.keys(deployment.files).map((f) => (
                    <TabsTrigger key={f} value={f} className="text-xs gap-1.5">
                      <FileCode className="h-3 w-3" />
                      {f}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(deployment.files).map(([name, content]) => (
                  <TabsContent key={name} value={name}>
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 gap-1 text-xs h-7"
                        onClick={() => {
                          navigator.clipboard.writeText(content);
                          toast({ title: 'Copied to clipboard', description: name });
                        }}
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                      <pre className="text-[11px] font-mono bg-zinc-950 dark:bg-black/40 text-zinc-200 dark:text-zinc-300 p-4 rounded-md overflow-x-auto max-h-[480px] leading-relaxed">
                        {content}
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {!deployment && !deploying && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-7 w-7 text-primary" />
            </div>
            <p className="font-semibold mb-1">Ready to deploy</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Click “Deploy Now” to generate a complete FastAPI inference service with Dockerfile, docker-compose, requirements, and OpenAPI spec.
            </p>
            <Button onClick={deploy} className="gap-2">
              <Rocket className="h-4 w-4" /> Deploy Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  const { toast } = useToast();
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className={cn('flex-1 rounded-md bg-muted/40 border border-border/40 px-3 py-1.5 text-sm truncate', mono && 'font-mono text-xs')}>
          {value}
        </div>
        {copyable && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast({ title: 'Copied', description: label });
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
