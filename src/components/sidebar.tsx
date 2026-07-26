'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import type { ViewKey } from '@/lib/types';
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Cpu,
  Trophy,
  Sparkles,
  Rocket,
  FileText,
  Activity,
  FlaskConical,
  Hammer,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  view: ViewKey;
  label: string;
  icon: LucideIcon;
  group: 'workspace' | 'pipeline' | 'ops';
  requiresDataset?: boolean;
  requiresModels?: boolean;
}

const NAV: NavItem[] = [
  { view: 'dashboard', label: 'Overview', icon: LayoutDashboard, group: 'workspace' },
  { view: 'upload', label: 'Upload Dataset', icon: UploadCloud, group: 'pipeline' },
  { view: 'eda', label: 'EDA & Profiling', icon: BarChart3, group: 'pipeline', requiresDataset: true },
  { view: 'training', label: 'Training Pipeline', icon: Cpu, group: 'pipeline', requiresDataset: true },
  { view: 'leaderboard', label: 'Leaderboard', icon: Trophy, group: 'pipeline', requiresModels: true },
  { view: 'explain', label: 'Explainability', icon: Sparkles, group: 'pipeline', requiresModels: true },
  { view: 'experiments', label: 'Experiments', icon: FlaskConical, group: 'ops' },
  { view: 'deploy', label: 'Deployments', icon: Rocket, group: 'ops', requiresModels: true },
  { view: 'monitoring', label: 'Monitoring', icon: Activity, group: 'ops' },
  { view: 'reports', label: 'Reports', icon: FileText, group: 'ops' },
];

export function Sidebar() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const dataset = useStore((s) => s.dataset);
  const models = useStore((s) => s.models);
  const trainingActive = useStore((s) => s.trainingActive);
  const trainingProgress = useStore((s) => s.trainingProgress);

  const groups: { key: NavItem['group']; label: string }[] = [
    { key: 'workspace', label: '01 / Workspace' },
    { key: 'pipeline', label: '02 / ML Pipeline' },
    { key: 'ops', label: '03 / MLOps' },
  ];

  return (
    <aside className="hidden md:flex w-64 lg:w-72 flex-col bg-sidebar border-r-2 border-border">

      <div className="h-16 flex items-center gap-2.5 px-5 border-b-2 border-border bg-foreground text-background">
        <Link
          href="#"
          onClick={(e) => { e.preventDefault(); setView('landing'); }}
          className="flex items-center gap-2.5 group"
        >
          <div className="h-9 w-9 bg-primary flex items-center justify-center brutal-border">
            <Hammer className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[15px] tracking-tight">nexusml</span>
            <span className="text-[9px] uppercase tracking-[0.2em] opacity-70">AUTOML PLATFORM</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-0 py-4 space-y-6">
        {groups.map((group) => {
          const items = NAV.filter((n) => n.group === group.key);
          return (
            <div key={group.key} className="space-y-0">
              <div className="px-5 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {group.label}
              </div>
              <div className="space-y-0 border-y-2 border-border/20">
                {items.map((item) => {
                  const disabled =
                    (item.requiresDataset && !dataset) ||
                    (item.requiresModels && models.length === 0);
                  const Icon = item.icon;
                  const active = view === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => !disabled && setView(item.view)}
                      disabled={disabled}
                      className={cn(
                        'w-full flex items-center gap-3 px-5 py-2.5 text-[13px] transition-all relative border-b-2 border-border/20',
                        active
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-foreground hover:bg-foreground hover:text-background',
                        disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
                      <span className="flex-1 text-left uppercase tracking-wide">{item.label}</span>
                      {item.view === 'training' && trainingActive && (
                        <span className="text-[10px] tabular-nums font-bold bg-accent text-accent-foreground px-1">
                          {Math.round(trainingProgress)}%
                        </span>
                      )}
                      {item.view === 'leaderboard' && models.length > 0 && !trainingActive && (
                        <span className="text-[10px] tabular-nums font-bold border-2 border-border px-1">
                          {models.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>


      <div className="border-t-2 border-border p-3">
        <div className="bg-foreground text-background p-3 brutal-border">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2 h-2 bg-primary pulse-dot" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">ENGINE ONLINE</span>
          </div>
          <p className="text-[10px] leading-relaxed opacity-80">
            24 MODELS / OPTUNA HPO / 5-FOLD CV / SHAP / MLFLOW
          </p>
        </div>
      </div>
    </aside>
  );
}
