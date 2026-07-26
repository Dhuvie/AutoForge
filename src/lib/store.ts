


'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DeploymentInfo,
  Experiment,
  ModelResult,
  ParsedDataset,
  ViewKey,
} from './types';

export interface ProjectMeta {
  id: string;
  name: string;
  description: string;
  taskType?: 'classification' | 'regression';
  createdAt: number;
}

interface NexusMLState {

  view: ViewKey;
  setView: (v: ViewKey) => void;


  project: ProjectMeta | null;
  setProject: (p: ProjectMeta | null) => void;


  dataset: ParsedDataset | null;
  setDataset: (d: ParsedDataset | null) => void;
  targetColumn: string | null;
  setTargetColumn: (c: string | null) => void;


  experiment: Experiment | null;
  setExperiment: (e: Experiment | null) => void;
  models: ModelResult[];
  setModels: (m: ModelResult[]) => void;
  updateModel: (id: string, patch: Partial<ModelResult>) => void;
  appendLog: (id: string, line: string) => void;
  trainingActive: boolean;
  setTrainingActive: (b: boolean) => void;
  trainingProgress: number;
  setTrainingProgress: (p: number) => void;


  winner: ModelResult | null;
  setWinner: (m: ModelResult | null) => void;


  deployment: DeploymentInfo | null;
  setDeployment: (d: DeploymentInfo | null) => void;


  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
}

export const useStore = create<NexusMLState>()(
  persist(
    (set, get) => ({
      view: 'landing',
      setView: (v) => set({ view: v }),

      project: null,
      setProject: (p) => set({ project: p }),

      dataset: null,
      setDataset: (d) => {
        const targetCandidate = d?.profile.targetCandidate ?? null;
        set({ dataset: d, targetColumn: targetCandidate });
      },
      targetColumn: null,
      setTargetColumn: (c) => set({ targetColumn: c }),

      experiment: null,
      setExperiment: (e) => set({ experiment: e }),

      models: [],
      setModels: (m) => set({ models: m }),
      updateModel: (id, patch) =>
        set((s) => ({
          models: s.models.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      appendLog: (id, line) =>
        set((s) => ({
          models: s.models.map((m) =>
            m.id === id ? { ...m, logLines: [...(m.logLines ?? []), line] } : m,
          ),
        })),

      trainingActive: false,
      setTrainingActive: (b) => set({ trainingActive: b }),
      trainingProgress: 0,
      setTrainingProgress: (p) => set({ trainingProgress: p }),

      winner: null,
      setWinner: (m) => set({ winner: m }),

      deployment: null,
      setDeployment: (d) => set({ deployment: d }),

      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: 'nexus-ml-session',

      partialize: (s) => ({
        view: s.view,
        project: s.project,
        targetColumn: s.targetColumn,
        experiment: s.experiment,
        models: s.models.map((m) => ({ ...m, logLines: [] })),
        winner: s.winner,
        deployment: s.deployment,
        theme: s.theme,
      }),
    },
  ),
);
