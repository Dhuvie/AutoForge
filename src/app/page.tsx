'use client';

import { useStore } from '@/lib/store';
import { LandingView } from '@/components/views/landing-view';
import { AppShell } from '@/components/app-shell';
import { DashboardView } from '@/components/views/dashboard-view';
import { UploadView } from '@/components/views/upload-view';
import { EdaView } from '@/components/views/eda-view';
import { TrainingView } from '@/components/views/training-view';
import { LeaderboardView } from '@/components/views/leaderboard-view';
import { ExplainView } from '@/components/views/explain-view';
import { DeployView } from '@/components/views/deploy-view';
import { ReportsView } from '@/components/views/reports-view';
import { MonitoringView } from '@/components/views/monitoring-view';
import { ExperimentsView } from '@/components/views/experiments-view';

export default function Home() {
  const view = useStore((s) => s.view);


  if (view === 'landing') {
    return <LandingView />;
  }

  const content = (() => {
    switch (view) {
      case 'dashboard': return <DashboardView />;
      case 'upload': return <UploadView />;
      case 'eda': return <EdaView />;
      case 'training': return <TrainingView />;
      case 'leaderboard': return <LeaderboardView />;
      case 'explain': return <ExplainView />;
      case 'deploy': return <DeployView />;
      case 'reports': return <ReportsView />;
      case 'monitoring': return <MonitoringView />;
      case 'experiments': return <ExperimentsView />;
      default: return <DashboardView />;
    }
  })();

  return <AppShell>{content}</AppShell>;
}
