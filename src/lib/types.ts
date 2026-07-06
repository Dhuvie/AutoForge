

export type TaskType = 'classification' | 'regression';
export type ClassificationSubtype = 'binary' | 'multiclass';

export type ColumnType =
  | 'numerical'
  | 'categorical'
  | 'datetime'
  | 'boolean'
  | 'text'
  | 'id'
  | 'target';

export interface ColumnSchema {
  name: string;
  type: ColumnType;
  role: 'feature' | 'target' | 'id' | 'drop';
  dtype: string;
  missing: number;
  missingPct: number;
  unique: number;
  examples: string[];

  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  skew?: number;

  topCategories?: { value: string; count: number; pct: number }[];

  warnings: string[];
}

export interface DataProfile {
  rowCount: number;
  colCount: number;
  duplicateRows: number;
  constantColumns: string[];
  quasiConstantColumns: string[];
  highCardinalityColumns: string[];
  skewedColumns: string[];
  correlatedPairs: { a: string; b: string; corr: number }[];
  missingTotal: number;
  memoryMb: number;
  targetCandidate: string | null;
  taskType: TaskType | null;
  classificationSubtype?: ClassificationSubtype;
  targetClasses?: string[];
}

export interface ParsedDataset {
  filename: string;
  columns: string[];
  rows: Record<string, string | number | boolean | null>[];
  schema: ColumnSchema[];
  profile: DataProfile;
  head: Record<string, string | number | boolean | null>[];
}

export type ModelFamily =
  | 'tree'
  | 'linear'
  | 'neighbor'
  | 'neural'
  | 'ensemble'
  | 'naive_bayes'
  | 'svm';

export interface ModelResult {
  id: string;
  name: string;
  family: ModelFamily;
  taskType: TaskType;
  primaryScore: number;
  secondaryScore: number;
  cvStd: number;
  trainTimeMs: number;
  params: Record<string, string | number | boolean>;
  metrics: {
    accuracy?: number;
    f1?: number;
    precision?: number;
    recall?: number;
    rocAuc?: number;
    rmse?: number;
    mae?: number;
    r2?: number;
  };
  isWinner?: boolean;
  isEnsemble?: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: number;
  finishedAt?: number;
  logLines?: string[];

  featureImportance?: { feature: string; importance: number }[];

  predictions?: { actual: string | number; predicted: string | number; proba?: number; correct: boolean }[];
  confusionMatrix?: number[][];
  residuals?: { predicted: number; residual: number }[];
}

export interface Experiment {
  id: string;
  projectId: string;
  datasetId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  taskType: TaskType;
  startedAt: number;
  finishedAt?: number;
  config: {
    timeBudgetSec: number;
    cvFolds: number;
    enableEnsemble: boolean;
    enableHpo: boolean;
    metric: string;
    selectedModels: string[];
  };
  results?: {
    winner: string;
    totalModels: number;
    bestScore: number;
    ensembledScore: number;
    improvement: number;
  };
}

export interface DeploymentInfo {
  id: string;
  modelId: string;
  modelName: string;
  endpoint: string;
  apiKey: string;
  status: 'deployed' | 'stopped';
  createdAt: number;
  dockerImage: string;
  openApiUrl: string;
}

export type ViewKey =
  | 'landing'
  | 'dashboard'
  | 'upload'
  | 'eda'
  | 'training'
  | 'leaderboard'
  | 'explain'
  | 'deploy'
  | 'reports'
  | 'experiments'
  | 'monitoring';
