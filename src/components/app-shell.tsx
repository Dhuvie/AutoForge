'use client';

import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { ThemeProvider } from '@/components/theme-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const project = useStore((s) => s.project);
  const dataset = useStore((s) => s.dataset);
  const trainingActive = useStore((s) => s.trainingActive);

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 border-l-2 border-border">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-8">
              {children}
            </div>
            <footer className="border-t-2 border-border mt-12 py-5 px-4 md:px-8 text-[11px] uppercase tracking-wider">
              <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground">AUTOFORGE.AI</span>
                  <span className="text-muted-foreground">/</span>
                  <span>V1.0.0-RC.1</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">BUILT FOR PRODUCTION ML</span>
                </div>
                <div className="flex items-center gap-4">
                  {project && (
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 bg-primary pulse-dot" />
                      <span className="font-bold">{project.name.toUpperCase()}</span>
                    </span>
                  )}
                  {dataset && (
                    <span className="text-muted-foreground">DS: {dataset.filename ?? 'LOADED'}</span>
                  )}
                  {trainingActive && (
                    <span className="flex items-center gap-1.5 bg-accent text-accent-foreground px-2 py-1 font-bold">
                      <span className="inline-block w-2 h-2 bg-accent-foreground pulse-dot" />
                      TRAINING
                    </span>
                  )}
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
