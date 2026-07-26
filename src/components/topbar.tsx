'use client';

import { useStore } from '@/lib/store';
import type { ViewKey } from '@/lib/types';
import {
  Moon,
  Sun,
  Search,
  Command,
  Bell,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const VIEW_TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  landing: { title: 'Welcome', subtitle: '' },
  dashboard: { title: 'Workspace Overview', subtitle: 'Projects, datasets, and recent activity' },
  upload: { title: 'Upload Dataset', subtitle: 'Drag-and-drop CSV or use a sample dataset' },
  eda: { title: 'Exploratory Data Analysis', subtitle: 'Automatic profiling, distributions, and correlations' },
  training: { title: 'Training Pipeline', subtitle: '24-model AutoML with Optuna HPO and live leaderboard' },
  leaderboard: { title: 'Model Leaderboard', subtitle: 'Compare all trained models by primary metric' },
  explain: { title: 'Explainability & XAI', subtitle: 'SHAP, PDP, confusion, residuals, fairness' },
  deploy: { title: 'Deployments', subtitle: 'FastAPI + Docker packaging with API key' },
  reports: { title: 'Reports', subtitle: 'Downloadable PDF/Markdown experiment reports' },
  experiments: { title: 'Experiments', subtitle: 'Experiment tracking with version history' },
  monitoring: { title: 'Monitoring', subtitle: 'Drift, latency, and inference analytics' },
};

export function Topbar() {
  const view = useStore((s) => s.view);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const project = useStore((s) => s.project);
  const setView = useStore((s) => s.setView);
  const trainingActive = useStore((s) => s.trainingActive);
  const trainingProgress = useStore((s) => s.trainingProgress);

  const meta = VIEW_TITLES[view] ?? VIEW_TITLES.dashboard;

  return (
    <header className="h-16 border-b-2 border-border bg-background flex items-center gap-4 px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="text-muted-foreground hidden sm:inline uppercase tracking-wider">nexusml</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 hidden sm:inline" strokeWidth={2.5} />
          {project ? (
            <span className="font-bold uppercase tracking-wide truncate max-w-[160px]">{project.name}</span>
          ) : (
            <span className="text-muted-foreground uppercase tracking-wide">UNTITLED</span>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={2.5} />
          <span className="font-bold uppercase tracking-wide">{meta.title}</span>
        </div>
      </div>

      <div className="relative hidden lg:block w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground" strokeWidth={2.5} />
        <Input
          placeholder="SEARCH MODELS, DATASETS, RUNS…"
          className="pl-9 pr-12 h-9 bg-muted border-2 border-border text-[11px] uppercase tracking-wider placeholder:text-muted-foreground focus-visible:outline-accent"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-foreground border-2 border-border bg-background px-1.5 py-0.5 flex items-center gap-0.5 font-bold">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </div>

      {trainingActive && (
        <div className="hidden md:flex items-center gap-1.5 border-2 border-border bg-accent text-accent-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
          <span className="inline-block w-1.5 h-1.5 bg-accent-foreground pulse-dot" />
          TRAINING / {Math.round(trainingProgress)}%
        </div>
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 border-2 border-border bg-background hover:bg-foreground hover:text-background"
        aria-label="Toggle theme"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" strokeWidth={2.5} /> : <Moon className="h-4 w-4" strokeWidth={2.5} />}
      </Button>

      <Button variant="outline" size="icon" className="h-9 w-9 border-2 border-border bg-background hover:bg-foreground hover:text-background" aria-label="Notifications">
        <Bell className="h-4 w-4" strokeWidth={2.5} />
      </Button>

      <Button
        variant="default"
        size="sm"
        className="hidden md:flex items-center gap-1.5 h-9 bg-foreground text-background border-2 border-border font-bold uppercase tracking-wider text-[11px] hover:bg-primary hover:text-primary-foreground"
        onClick={() => setView('upload')}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        NEW RUN
      </Button>

      <div className="h-9 w-9 bg-primary text-primary-foreground border-2 border-border flex items-center justify-center text-xs font-bold">
        AF
      </div>
    </header>
  );
}
