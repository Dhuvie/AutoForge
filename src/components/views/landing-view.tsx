'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Hammer,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Cpu,
  Trophy,
  Rocket,
  Shield,
  Activity,
  GitBranch,
  Zap,
  BarChart3,
  CheckCircle2,
  Brain,
  Layers,
  Database,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingView() {
  const setView = useStore((s) => s.setView);
  const setProject = useStore((s) => s.setProject);

  const start = () => {
    if (!useStore.getState().project) {
      setProject({
        id: `proj_${Date.now().toString(36)}`,
        name: 'My First AutoML Project',
        description: 'Created from the landing page',
        createdAt: Date.now(),
      });
    }
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      <nav className="sticky top-0 z-50 border-b-2 border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary border-2 border-border flex items-center justify-center">
              <Hammer className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[15px] tracking-tight">nexusml</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em]">AUTOML PLATFORM</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[12px] uppercase tracking-wider font-medium">
            <a href="#features" className="hover:text-accent transition-colors">FEATURES</a>
            <a href="#pipeline" className="hover:text-accent transition-colors">PIPELINE</a>
            <a href="#models" className="hover:text-accent transition-colors">MODELS</a>
            <a href="#architecture" className="hover:text-accent transition-colors">ARCHITECTURE</a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('dashboard')}
              className="hidden sm:flex border-2 border-border bg-background hover:bg-foreground hover:text-background font-bold uppercase tracking-wider text-[11px]"
            >
              SIGN IN
            </Button>
            <Button
              size="sm"
              onClick={start}
              className="gap-1.5 bg-foreground text-background border-2 border-border hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider text-[11px]"
            >
              LAUNCH CONSOLE
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
            </Button>
          </div>
        </div>
      </nav>


      <section className="relative border-b-2 border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid" />


        <div className="border-b-2 border-border bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold overflow-hidden whitespace-nowrap">
            <span className="flex-shrink-0">★ 24 MODELS</span>
            <span className="text-muted-foreground">/</span>
            <span className="flex-shrink-0">OPTUNA HPO</span>
            <span className="text-muted-foreground">/</span>
            <span className="flex-shrink-0">SHAP XAI</span>
            <span className="text-muted-foreground">/</span>
            <span className="flex-shrink-0">1-CLICK DEPLOY</span>
            <span className="text-muted-foreground">/</span>
            <span className="flex-shrink-0">★ 24 MODELS</span>
            <span className="text-muted-foreground">/</span>
            <span className="flex-shrink-0">OPTUNA HPO</span>
            <span className="text-muted-foreground">/</span>
            <span className="flex-shrink-0">SHAP XAI</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 md:px-8 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 border-2 border-border bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-8 brutal-shadow">
            <Sparkles className="h-3 w-3" strokeWidth={3} />
            OPEN-SOURCE / PRODUCTION-READY / MIT
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-6 uppercase">
            Train the world&apos;s
            <br />
            best{' '}
            <span className="bg-primary px-2 brutal-border inline-block">ML MODELS</span>
            <br />
            with one click.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            UPLOAD ANY STRUCTURED DATASET. nexusml PROFILES IT, ENGINEERS FEATURES,
            TRAINS TWO DOZEN MODELS IN PARALLEL, OPTIMIZES HYPERPARAMETERS, BUILDS
            ENSEMBLES, EXPLAINS THE RESULT — AND SHIPS IT AS A DOCKERIZED REST API.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Button
              size="lg"
              onClick={start}
              className="gap-2 h-14 px-8 text-base bg-foreground text-background border-2 border-border hover:bg-primary hover:text-primary-foreground brutal-shadow brutal-hover font-bold uppercase tracking-wider"
            >
              START FREE / UPLOAD CSV
              <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView('dashboard')}
              className="gap-2 h-14 px-8 text-base bg-background border-2 border-border hover:bg-foreground hover:text-background font-bold uppercase tracking-wider"
            >
              <BarChart3 className="h-5 w-5" strokeWidth={2.5} />
              VIEW DEMO
            </Button>
          </div>


          <div className="border-2 border-border brutal-shadow">
            <div className="grid grid-cols-3 md:grid-cols-5 divide-x-2 divide-border">
              {[
                { icon: Cpu, label: '24 MODELS', sub: 'PARALLEL' },
                { icon: Zap, label: 'OPTUNA', sub: 'BAYESIAN HPO' },
                { icon: Sparkles, label: 'SHAP', sub: 'GLOBAL+LOCAL' },
                { icon: Trophy, label: 'ENSEMBLE', sub: 'STACKED TOP-3' },
                { icon: Rocket, label: 'DEPLOY', sub: 'FASTAPI+DOCKER' },
              ].map((s, i) => (
                <div key={i} className="p-3 md:p-4 text-left bg-background hover:bg-primary transition-colors">
                  <s.icon className="h-5 w-5 mb-1.5" strokeWidth={2.5} />
                  <div className="text-xs font-bold uppercase tracking-wider">{s.label}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider hidden md:block">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <ArrowDown className="h-3 w-3 animate-bounce" strokeWidth={3} />
            SCROLL TO EXPLORE
          </div>
        </div>
      </section>


      <section id="pipeline" className="py-20 border-b-2 border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">/ END-TO-END PIPELINE</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-3">
              From CSV to
              <br />
              production in <span className="bg-primary text-primary-foreground px-2">6 stages</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl uppercase tracking-wider text-[11px]">
              EVERY STAGE RUNS AUTOMATICALLY. YOU NEVER WRITE CODE — YOU STEER.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-0 border-2 border-border">
            {[
              { n: '01', icon: Database, title: 'UPLOAD', desc: 'Drag-drop CSV. Auto-detected schema, types, and target.' },
              { n: '02', icon: BarChart3, title: 'PROFILE', desc: 'EDA, missingness, correlations, skew, outliers.' },
              { n: '03', icon: Workflow, title: 'ENGINEER', desc: 'Encodings, transforms, interactions, PCA.' },
              { n: '04', icon: Cpu, title: 'TRAIN', desc: '24 models, 5-fold CV, Optuna HPO in parallel.' },
              { n: '05', icon: Sparkles, title: 'EXPLAIN', desc: 'SHAP, PDP, confusion, residuals, fairness.' },
              { n: '06', icon: Rocket, title: 'DEPLOY', desc: 'FastAPI service + Dockerfile + API key.' },
            ].map((s, i) => (
              <div
                key={i}
                className={cn(
                  'p-5 border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group',
                  i < 5 && 'border-r-2',
                  i < 3 && 'border-b-2 lg:border-b-0',
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-foreground text-background group-hover:bg-primary-foreground group-hover:text-primary flex items-center justify-center brutal-border">
                    <s.icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <span className="text-3xl font-bold text-muted-foreground/30 group-hover:text-primary-foreground tabular-nums">{s.n}</span>
                </div>
                <h3 className="font-bold text-base uppercase tracking-tight mb-2">{s.title}</h3>
                <p className="text-[11px] leading-relaxed uppercase tracking-wider opacity-80">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="features" className="py-20 border-b-2 border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-2">/ CAPABILITIES</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-3">
              Everything a data
              <br />
              scientist would do.
              <br />
              <span className="bg-accent text-accent-foreground px-2">Automatically.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-2 border-border">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={cn(
                  'p-6 bg-background border-border hover:bg-foreground hover:text-background transition-colors group',
                  (i + 1) % 3 !== 0 && 'lg:border-r-2',
                  (i + 1) % 2 !== 0 && 'md:border-r-2 lg:border-r-2',
                  i < FEATURES.length - (FEATURES.length % 3 === 0 ? 3 : FEATURES.length % 3) && 'border-b-2',
                )}
              >
                <div className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center mb-4 brutal-border group-hover:bg-background group-hover:text-foreground">
                  <f.icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-base uppercase tracking-tight mb-2">{f.title}</h3>
                <p className="text-[12px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="models" className="py-20 border-b-2 border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">/ MODEL LIBRARY</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-3">
              24 state-of-the-art
              <br />
              <span className="bg-primary text-primary-foreground px-2">algorithms</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl uppercase tracking-wider text-[11px]">
              TREE ENSEMBLES, LINEAR MODELS, NEIGHBORS, SVMS, NAIVE BAYES, DEEP NETS,
              AND EXPLAINABLE BOOSTERS — ALL TRAINED, RANKED, AND READY TO ENSEMBLE.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-background">
            {MODEL_FAMILIES.map((fam, i) => (
              <div
                key={i}
                className={cn(
                  'p-5 border-background',
                  i < MODEL_FAMILIES.length - 1 && 'border-r-2',
                  i < 2 && 'border-b-2 lg:border-b-0',
                )}
              >
                <div className="flex items-center justify-between mb-3 border-b-2 border-background pb-2">
                  <h3 className="font-bold text-sm uppercase tracking-wide">{fam.family}</h3>
                  <span className="text-[10px] font-bold border-2 border-background px-1.5 py-0.5 tabular-nums">{fam.models.length}</span>
                </div>
                <ul className="space-y-1.5">
                  {fam.models.map((m, j) => (
                    <li key={j} className="flex items-start gap-2 text-[11px] uppercase tracking-wider">
                      <span className="text-primary font-bold flex-shrink-0">[+]</span>
                      <span className="opacity-80">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="architecture" className="py-20 border-b-2 border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-2">/ SYSTEM DESIGN</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-3">
              Production-grade
              <br />
              <span className="bg-primary px-2">architecture</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl uppercase tracking-wider text-[11px]">
              BUILT LIKE A REAL ENTERPRISE ML PLATFORM — MODULAR SERVICES, ASYNC WORKERS,
              OBJECT STORAGE, EXPERIMENT TRACKING, MODEL REGISTRY.
            </p>
          </div>
          <ArchitectureDiagram />
        </div>
      </section>


      <section className="py-20 border-b-2 border-border bg-primary">
        <div className="absolute inset-0 brutal-stripes opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-4">
            Forge your first
            <br />
            model in 60 seconds.
          </h2>
          <p className="text-foreground/70 text-base uppercase tracking-wider mb-8 max-w-xl mx-auto">
            NO CREDIT CARD. NO SETUP. JUST UPLOAD A CSV AND WATCH THE LEADERBOARD FILL UP.
          </p>
          <Button
            size="lg"
            onClick={start}
            className="gap-2 h-14 px-8 text-base bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground brutal-shadow brutal-hover font-bold uppercase tracking-wider"
          >
            LAUNCH nexusml CONSOLE
            <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </Button>
        </div>
      </section>


      <footer className="bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-primary border-2 border-border flex items-center justify-center">
              <Hammer className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold">nexusml</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">OPEN-SOURCE AUTOML</span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <a href="#" className="hover:text-accent transition-colors">DOCS</a>
            <a href="#" className="hover:text-accent transition-colors">GITHUB</a>
            <a href="#" className="hover:text-accent transition-colors">API</a>
            <a href="#" className="hover:text-accent transition-colors">STATUS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Brain, title: 'DATASET INTELLIGENCE', desc: 'Detects column types, target, leakage, duplicates, quasi-constants, skew, outliers, and correlated features — with actionable warnings.' },
  { icon: Workflow, title: 'FEATURE ENGINEERING', desc: 'Polynomial, interactions, target/frequency/hash encoding, Box-Cox, Yeo-Johnson, winsorization, PCA, UMAP — automatic and compared.' },
  { icon: Cpu, title: 'PARALLEL TRAINING', desc: '24 models trained concurrently with 5-fold cross-validation. Live progress, live logs, live leaderboard updates.' },
  { icon: Zap, title: 'BAYESIAN HPO', desc: 'Optuna TPE sampler with pruning, early stopping, and resume-on-failure. GPU-aware. Time-budgeted.' },
  { icon: Layers, title: 'AUTO-ENSEMBLING', desc: 'Top-3 stacked ensemble with logistic meta-learner, plus voting, blending, and rank averaging — auto-selected.' },
  { icon: Sparkles, title: 'EXPLAINABILITY SUITE', desc: 'SHAP summary/waterfall/force/beeswarm, PDP, ICE, LIME, permutation importance, counterfactuals, NL summaries.' },
  { icon: Shield, title: 'BIAS & FAIRNESS', desc: 'Protected-attribute detection, disparate impact, equal opportunity, demographic parity, with mitigation recommendations.' },
  { icon: Activity, title: 'DRIFT MONITORING', desc: 'PSI, KS-test, and feature-drift alerts. Concept drift detection on prediction streams with configurable thresholds.' },
  { icon: GitBranch, title: 'EXPERIMENT TRACKING', desc: 'MLflow-style tracking of params, metrics, artifacts, versions. Promote, archive, rollback, and stage models.' },
  { icon: Rocket, title: '1-CLICK DEPLOY', desc: 'Generates FastAPI service, Dockerfile, docker-compose, OpenAPI spec, and API key. Ship to any container runtime.' },
  { icon: BarChart3, title: 'ANALYTICS DASHBOARD', desc: 'Projects, experiments, training timelines, resource utilization, inference latency, error rates — all real-time.' },
  { icon: Trophy, title: 'DOWNLOADABLE REPORTS', desc: 'Auto-generated PDF/Markdown reports with EDA, model comparison, metrics, XAI, and business recommendations.' },
];

const MODEL_FAMILIES: { family: string; models: string[] }[] = [
  {
    family: 'TREE ENSEMBLES',
    models: ['Random Forest', 'Extra Trees', 'Decision Tree', 'XGBoost', 'LightGBM', 'CatBoost', 'HistGradientBoosting', 'Gradient Boosting', 'AdaBoost'],
  },
  {
    family: 'LINEAR MODELS',
    models: ['Logistic Regression', 'Ridge', 'Lasso', 'ElasticNet', 'Linear Regression'],
  },
  {
    family: 'NEIGHBORS & SVM',
    models: ['KNN (distance-weighted)', 'SVM (RBF kernel)'],
  },
  {
    family: 'NEURAL & PROBABILISTIC',
    models: ['MLP (128,64)', 'TabNet', 'NGBoost', 'Gaussian NB', 'Explainable Boosting Machine', 'Balanced Random Forest', 'Easy Ensemble'],
  },
];

function ArchitectureDiagram() {
  const layers: { title: string; tag: string; items: { name: string; desc: string }[]; tone: 'yellow' | 'black' | 'red' | 'white' }[] = [
    {
      title: 'CLIENT LAYER',
      tag: 'L1',
      tone: 'yellow',
      items: [
        { name: 'Next.js 16 + React 19', desc: 'App Router, TypeScript' },
        { name: 'Tailwind + shadcn/ui', desc: 'dark/light themes' },
        { name: 'Recharts + Plotly', desc: 'interactive viz' },
      ],
    },
    {
      title: 'API GATEWAY',
      tag: 'L2',
      tone: 'white',
      items: [
        { name: 'FastAPI', desc: 'async REST + WS' },
        { name: 'JWT + OAuth', desc: 'RBAC, rate limit' },
        { name: 'Pydantic v2', desc: 'input validation' },
      ],
    },
    {
      title: 'ML ENGINE',
      tag: 'L3',
      tone: 'black',
      items: [
        { name: 'Training workers', desc: 'Celery + Redis' },
        { name: 'Optuna HPO', desc: 'TPE, pruning, GPU' },
        { name: 'sklearn / XGB / LGBM', desc: '24 model library' },
      ],
    },
    {
      title: 'DATA & OPS',
      tag: 'L4',
      tone: 'red',
      items: [
        { name: 'PostgreSQL', desc: 'projects, exps' },
        { name: 'MinIO / S3', desc: 'datasets, artifacts' },
        { name: 'MLflow + Prom + Graf', desc: 'registry + mon' },
      ],
    },
  ];

  const toneClasses = {
    yellow: 'bg-primary text-primary-foreground border-foreground',
    black: 'bg-foreground text-background border-background',
    red: 'bg-accent text-accent-foreground border-foreground',
    white: 'bg-background text-foreground border-foreground',
  };

  return (
    <div className="grid md:grid-cols-4 gap-0 border-2 border-border">
      {layers.map((layer, i) => (
        <div
          key={i}
          className={cn(
            'p-5 border-border',
            i < layers.length - 1 && 'border-r-2',
            toneClasses[layer.tone],
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">LAYER {i + 1}</span>
            <span className="text-[10px] font-bold border-2 border-current px-1.5 py-0.5">{layer.tag}</span>
          </div>
          <div className="font-bold text-base uppercase tracking-tight mb-4 border-b-2 border-current pb-2">{layer.title}</div>
          <div className="space-y-2">
            {layer.items.map((item, j) => (
              <div key={j} className="border-2 border-current p-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wide">{item.name}</div>
                <div className="text-[9px] uppercase tracking-wider opacity-70">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
