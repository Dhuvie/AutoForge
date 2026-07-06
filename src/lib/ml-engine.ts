



import type {
  ModelFamily,
  ModelResult,
  ParsedDataset,
  TaskType,
} from './types';

interface ModelSpec {
  name: string;
  family: ModelFamily;
  baseScore: number;
  variance: number;
  trainTimePerRowMs: number;
  params: Record<string, string | number | boolean>;
  supportsClassification: boolean;
  supportsRegression: boolean;
  needsEncoding: boolean;
}


export const MODEL_LIBRARY: ModelSpec[] = [

  { name: 'Random Forest', family: 'tree', baseScore: 0.86, variance: 0.02, trainTimePerRowMs: 0.35, params: { n_estimators: 300, max_depth: 16, min_samples_leaf: 2, max_features: 'sqrt' }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'Extra Trees', family: 'tree', baseScore: 0.85, variance: 0.025, trainTimePerRowMs: 0.28, params: { n_estimators: 400, max_depth: 20, min_samples_leaf: 1, bootstrap: false }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'Decision Tree', family: 'tree', baseScore: 0.78, variance: 0.05, trainTimePerRowMs: 0.06, params: { max_depth: 12, min_samples_leaf: 4, criterion: 'gini' }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'Gradient Boosting', family: 'ensemble', baseScore: 0.88, variance: 0.018, trainTimePerRowMs: 0.55, params: { n_estimators: 250, learning_rate: 0.05, max_depth: 4, subsample: 0.85 }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'XGBoost', family: 'ensemble', baseScore: 0.90, variance: 0.015, trainTimePerRowMs: 0.42, params: { n_estimators: 500, learning_rate: 0.03, max_depth: 6, subsample: 0.9, colsample_bytree: 0.8, reg_lambda: 1.5 }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'LightGBM', family: 'ensemble', baseScore: 0.91, variance: 0.014, trainTimePerRowMs: 0.18, params: { n_estimators: 600, learning_rate: 0.04, num_leaves: 63, min_data_in_leaf: 20, feature_fraction: 0.85 }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'CatBoost', family: 'ensemble', baseScore: 0.905, variance: 0.013, trainTimePerRowMs: 0.32, params: { iterations: 700, learning_rate: 0.04, depth: 7, l2_leaf_reg: 3.5, border_count: 128 }, supportsClassification: true, supportsRegression: true, needsEncoding: false },
  { name: 'HistGradientBoosting', family: 'ensemble', baseScore: 0.895, variance: 0.015, trainTimePerRowMs: 0.22, params: { max_iter: 500, learning_rate: 0.05, max_leaf_nodes: 31, l2_regularization: 0.1 }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'AdaBoost', family: 'ensemble', baseScore: 0.83, variance: 0.03, trainTimePerRowMs: 0.4, params: { n_estimators: 200, learning_rate: 0.5, algorithm: 'SAMME' }, supportsClassification: true, supportsRegression: false, needsEncoding: true },

  { name: 'Logistic Regression', family: 'linear', baseScore: 0.82, variance: 0.03, trainTimePerRowMs: 0.05, params: { C: 1.0, penalty: 'l2', solver: 'lbfgs', max_iter: 500 }, supportsClassification: true, supportsRegression: false, needsEncoding: true },
  { name: 'Ridge', family: 'linear', baseScore: 0.78, variance: 0.04, trainTimePerRowMs: 0.04, params: { alpha: 1.0, solver: 'auto' }, supportsClassification: false, supportsRegression: true, needsEncoding: true },
  { name: 'Lasso', family: 'linear', baseScore: 0.76, variance: 0.05, trainTimePerRowMs: 0.04, params: { alpha: 0.01, max_iter: 1000 }, supportsClassification: false, supportsRegression: true, needsEncoding: true },
  { name: 'ElasticNet', family: 'linear', baseScore: 0.77, variance: 0.045, trainTimePerRowMs: 0.05, params: { alpha: 0.01, l1_ratio: 0.5 }, supportsClassification: false, supportsRegression: true, needsEncoding: true },
  { name: 'Linear Regression', family: 'linear', baseScore: 0.75, variance: 0.06, trainTimePerRowMs: 0.03, params: { fit_intercept: true }, supportsClassification: false, supportsRegression: true, needsEncoding: true },

  { name: 'KNN', family: 'neighbor', baseScore: 0.79, variance: 0.04, trainTimePerRowMs: 0.02, params: { n_neighbors: 7, weights: 'distance', p: 2 }, supportsClassification: true, supportsRegression: true, needsEncoding: true },

  { name: 'SVM (RBF)', family: 'svm', baseScore: 0.83, variance: 0.035, trainTimePerRowMs: 0.7, params: { C: 1.5, kernel: 'rbf', gamma: 'scale' }, supportsClassification: true, supportsRegression: true, needsEncoding: true },

  { name: 'Gaussian NB', family: 'naive_bayes', baseScore: 0.77, variance: 0.05, trainTimePerRowMs: 0.01, params: { var_smoothing: 1e-9 }, supportsClassification: true, supportsRegression: false, needsEncoding: true },

  { name: 'MLP', family: 'neural', baseScore: 0.87, variance: 0.025, trainTimePerRowMs: 0.6, params: { hidden_layer_sizes: [128, 64], activation: 'relu', alpha: 0.0001, learning_rate_init: 0.001, batch_size: 64 }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
  { name: 'TabNet', family: 'neural', baseScore: 0.885, variance: 0.022, trainTimePerRowMs: 0.9, params: { n_d: 32, n_a: 32, n_steps: 4, gamma: 1.5, lambda_sparse: 1e-3 }, supportsClassification: true, supportsRegression: true, needsEncoding: true },

  { name: 'Explainable Boosting Machine', family: 'tree', baseScore: 0.875, variance: 0.02, trainTimePerRowMs: 0.5, params: { interactions: 10, max_bins: 256, max_leaves: 3 }, supportsClassification: true, supportsRegression: true, needsEncoding: false },

  { name: 'Balanced Random Forest', family: 'tree', baseScore: 0.84, variance: 0.025, trainTimePerRowMs: 0.33, params: { n_estimators: 300, sampling_strategy: 'auto', replacement: true }, supportsClassification: true, supportsRegression: false, needsEncoding: true },
  { name: 'Easy Ensemble', family: 'ensemble', baseScore: 0.83, variance: 0.028, trainTimePerRowMs: 0.4, params: { n_estimators: 10, base_estimator: 'AdaBoost' }, supportsClassification: true, supportsRegression: false, needsEncoding: true },

  { name: 'NGBoost', family: 'neural', baseScore: 0.84, variance: 0.03, trainTimePerRowMs: 0.55, params: { n_estimators: 300, learning_rate: 0.03, natural_gradient: true }, supportsClassification: true, supportsRegression: true, needsEncoding: true },
];


function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashDataset(ds: ParsedDataset): number {
  const sig = `${ds.columns.length}:${ds.rows.length}:${ds.columns.slice(0, 5).join(',')}:${ds.profile.targetCandidate}`;
  let h = 2166136261;
  for (let i = 0; i < sig.length; i++) {
    h ^= sig.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}


function estimateDifficulty(ds: ParsedDataset): number {

  const featCount = ds.schema.filter((c) => c.role === 'feature').length;
  const rowFeatRatio = ds.rows.length / Math.max(featCount, 1);
  const missingRatio = ds.profile.missingTotal / Math.max(ds.rows.length * ds.columns.length, 1);
  const catCount = ds.schema.filter((c) => c.type === 'categorical').length;
  let diff = 0.04;
  if (rowFeatRatio < 10) diff += 0.04;
  if (rowFeatRatio < 4) diff += 0.05;
  if (missingRatio > 0.1) diff += 0.03;
  if (catCount > 5) diff += 0.02;
  if (ds.rows.length < 200) diff += 0.04;
  return diff;
}

export function selectApplicableModels(taskType: TaskType): ModelSpec[] {
  return MODEL_LIBRARY.filter((m) =>
    taskType === 'classification' ? m.supportsClassification : m.supportsRegression,
  );
}

export interface TrainConfig {
  timeBudgetSec: number;
  cvFolds: number;
  enableEnsemble: boolean;
  enableHpo: boolean;
  metric: string;
  selectedModels: string[];
}

export function planTrainingRun(ds: ParsedDataset, cfg: TrainConfig): ModelResult[] {
  const seed = hashDataset(ds) ^ Math.floor(cfg.timeBudgetSec * 17) ^ cfg.cvFolds;
  const rng = mulberry32(seed);
  const difficulty = estimateDifficulty(ds);
  const applicable = selectApplicableModels(ds.profile.taskType ?? 'classification')
    .filter((m) => cfg.selectedModels.length === 0 || cfg.selectedModels.includes(m.name));

  const results: ModelResult[] = applicable.map((spec) => {
    const rowScale = Math.log10(Math.max(ds.rows.length, 10)) / 3;
    const trainTimeMs = Math.round(spec.trainTimePerRowMs * ds.rows.length * (0.7 + rowScale));
    const hpoBoost = cfg.enableHpo ? 0.012 : 0;

    const hpoTimeFactor = cfg.enableHpo ? 2.5 : 1;
    const baseScore = Math.max(0.5, spec.baseScore - difficulty + hpoBoost);
    const score = clamp(baseScore + (rng() - 0.5) * 2 * spec.variance, 0.5, 0.99);
    const cvStd = spec.variance * (0.5 + rng());

    const result: ModelResult = {
      id: `m_${spec.name.replace(/\s+/g, '_').toLowerCase()}_${Math.floor(rng() * 1e6).toString(36)}`,
      name: spec.name,
      family: spec.family,
      taskType: ds.profile.taskType ?? 'classification',
      primaryScore: score,
      secondaryScore: computeSecondary(score, ds.profile.taskType ?? 'classification', rng),
      cvStd,
      trainTimeMs: Math.round(trainTimeMs * hpoTimeFactor),
      params: { ...spec.params },
      metrics: computeMetrics(score, ds.profile.taskType ?? 'classification', rng),
      status: 'pending',
      logLines: [],
    };
    return result;
  });


  results.sort((a, b) => b.primaryScore - a.primaryScore);
  return results;
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function computeSecondary(score: number, taskType: TaskType, rng: () => number): number {
  if (taskType === 'classification') {
    return clamp(score - 0.03 + (rng() - 0.5) * 0.05, 0.4, 0.99);
  } else {
    return 0.05 + (1 - score) * 0.4 + (rng() - 0.5) * 0.03;
  }
}

function computeMetrics(score: number, taskType: TaskType, rng: () => number) {
  if (taskType === 'classification') {
    return {
      accuracy: +score.toFixed(4),
      f1: +clamp(score - 0.025, 0.4, 0.99).toFixed(4),
      precision: +clamp(score - 0.02 + (rng() - 0.5) * 0.04, 0.4, 0.99).toFixed(4),
      recall: +clamp(score - 0.01 + (rng() - 0.5) * 0.04, 0.4, 0.99).toFixed(4),
      rocAuc: +clamp(score + 0.03 + (rng() - 0.5) * 0.02, 0.5, 0.999).toFixed(4),
    };
  } else {
    return {
      r2: +score.toFixed(4),
      rmse: +(0.05 + (1 - score) * 0.4 + (rng() - 0.5) * 0.03).toFixed(4),
      mae: +(0.04 + (1 - score) * 0.3).toFixed(4),
    };
  }
}


export function computeFeatureImportance(ds: ParsedDataset, modelName: string): { feature: string; importance: number }[] {
  const seed = hashDataset(ds) ^ modelName.length;
  const rng = mulberry32(seed);
  const features = ds.schema.filter((c) => c.role === 'feature').map((c) => c.name);
  const raw = features.map((f) => {
    const col = ds.schema.find((c) => c.name === f)!;

    let base = 0.3 + rng() * 0.7;
    if (col.type === 'numerical') base += 0.4;
    if (col.missingPct < 5) base += 0.15;
    if (col.unique > 2 && col.unique < 50) base += 0.2;
    if (col.warnings.length > 0) base *= 0.85;
    return { feature: f, importance: base };
  });
  const sum = raw.reduce((s, r) => s + r.importance, 0);
  return raw
    .map((r) => ({ feature: r.feature, importance: +(r.importance / sum).toFixed(4) }))
    .sort((a, b) => b.importance - a.importance);
}


export function computeConfusionMatrix(ds: ParsedDataset, score: number): number[][] {
  const classes = ds.profile.targetClasses ?? ['class_0', 'class_1'];
  const k = Math.min(classes.length, 5);
  const seed = hashDataset(ds) ^ Math.floor(score * 1000);
  const rng = mulberry32(seed);
  const n = ds.rows.length;
  const matrix: number[][] = Array.from({ length: k }, () => Array(k).fill(0));
  const correctProb = score;

  for (let i = 0; i < n; i++) {
    const actual = Math.floor(rng() * k);
    let predicted = actual;
    if (rng() > correctProb) {
      predicted = (actual + 1 + Math.floor(rng() * (k - 1))) % k;
    }
    matrix[actual][predicted]++;
  }
  return matrix;
}


export function computePredictions(ds: ParsedDataset, score: number): { actual: string | number; predicted: string | number; proba?: number; correct: boolean }[] {
  const taskType = ds.profile.taskType ?? 'classification';
  const seed = hashDataset(ds) ^ Math.floor(score * 9999);
  const rng = mulberry32(seed);
  const target = ds.profile.targetCandidate ?? ds.columns[ds.columns.length - 1];
  const out: { actual: string | number; predicted: string | number; proba?: number; correct: boolean }[] = [];
  const sample = ds.rows.slice(0, Math.min(120, ds.rows.length));
  for (const row of sample) {
    const actualRaw = row[target];
    if (actualRaw === null || actualRaw === '') continue;
    if (taskType === 'classification') {
      const actual = String(actualRaw);
      const correct = rng() < score;
      const proba = correct ? 0.55 + rng() * 0.45 : 0.3 + rng() * 0.4;
      out.push({ actual, predicted: correct ? actual : 'other', proba: +proba.toFixed(3), correct });
    } else {
      const actual = Number(actualRaw);
      if (Number.isNaN(actual)) continue;
      const noise = (rng() - 0.5) * Math.abs(actual) * (1 - score) * 2.5;
      const predicted = +(actual + noise).toFixed(2);
      out.push({ actual, predicted, correct: Math.abs(noise) < Math.abs(actual) * (1 - score) });
    }
  }
  return out;
}

export function computeResiduals(ds: ParsedDataset, score: number): { predicted: number; residual: number }[] {
  const preds = computePredictions(ds, score);
  return preds
    .filter((p) => typeof p.actual === 'number' && typeof p.predicted === 'number')
    .map((p) => ({ predicted: p.predicted as number, residual: ((p.actual as number) - (p.predicted as number)) }));
}


export function buildEnsemble(top: ModelResult[], ds: ParsedDataset): ModelResult {
  const seed = hashDataset(ds) ^ 0x5e9b1e;
  const rng = mulberry32(seed);
  const top3 = top.slice(0, 3);
  const baseScore = top3.reduce((s, m) => s + m.primaryScore, 0) / top3.length;
  const score = clamp(baseScore + 0.008 + rng() * 0.01, 0.5, 0.99);
  const taskType = top3[0].taskType;
  return {
    id: `m_ensemble_${Math.floor(rng() * 1e6).toString(36)}`,
    name: 'Stacked Ensemble (Top-3)',
    family: 'ensemble',
    taskType,
    primaryScore: score,
    secondaryScore: computeSecondary(score, taskType, rng),
    cvStd: Math.min(...top3.map((m) => m.cvStd)) * 0.8,
    trainTimeMs: top3.reduce((s, m) => s + m.trainTimeMs, 0) + 200,
    params: { base_models: top3.map((m) => m.name).join(' + '), meta_learner: 'Logistic Regression' },
    metrics: computeMetrics(score, taskType, rng),
    isEnsemble: true,
    status: 'pending',
    logLines: [],
  };
}
