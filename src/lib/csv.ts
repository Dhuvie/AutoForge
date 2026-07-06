


import type {
  ColumnSchema,
  ColumnType,
  DataProfile,
  ParsedDataset,
  TaskType,
  ClassificationSubtype,
} from './types';

const NUMERIC_RE = /^-?\d+(\.\d+)?$/;
const BOOL_RE = /^(true|false|yes|no|y|n|0|1)$/i;
const DATETIME_RE = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}([ T]\d{1,2}:\d{1,2}(:\d{1,2})?)?$/;

export interface ParseOptions {
  delimiter?: string;
  targetColumn?: string;
  maxRows?: number;
}

export function parseCsv(text: string, opts: ParseOptions = {}): ParsedDataset {
  const delimiter = opts.delimiter ?? detectDelimiter(text);
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row.');
  }

  const headers = splitCsvLine(lines[0], delimiter).map((h) => h.trim() || `col_${Math.random().toString(36).slice(2, 6)}`);
  const rows: Record<string, string | number | boolean | null>[] = [];

  const cap = opts.maxRows ?? 5000;
  for (let i = 1; i < lines.length && rows.length < cap; i++) {
    const cells = splitCsvLine(lines[i], delimiter);
    const row: Record<string, string | number | boolean | null> = {};
    headers.forEach((h, idx) => {
      const raw = (cells[idx] ?? '').trim();
      row[h] = raw === '' ? null : raw;
    });
    rows.push(row);
  }

  const schema = inferSchema(headers, rows, opts.targetColumn);
  const profile = buildProfile(headers, rows, schema);
  const head = rows.slice(0, 8);

  return {
    filename: opts.targetColumn ? `${opts.targetColumn}-dataset` : 'dataset.csv',
    columns: headers,
    rows,
    schema,
    profile,
    head,
  };
}

function detectDelimiter(text: string): string {
  const sample = text.split('\n').slice(0, 5).join('\n');
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = 0;
  for (const c of candidates) {
    const count = sample.split(c).length;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function inferSchema(
  headers: string[],
  rows: Record<string, string | number | boolean | null>[],
  targetColumn?: string,
): ColumnSchema[] {
  return headers.map((name) => {
    const values = rows.map((r) => r[name]).filter((v) => v !== null && v !== '') as string[];
    const sample = values.slice(0, 200);
    const numericCount = sample.filter((v) => NUMERIC_RE.test(String(v))).length;
    const boolCount = sample.filter((v) => BOOL_RE.test(String(v))).length;
    const dtCount = sample.filter((v) => DATETIME_RE.test(String(v))).length;
    const unique = new Set(values).size;
    const missing = rows.length - values.length;

    let type: ColumnType = 'categorical';
    let dtype = 'object';
    const warnings: string[] = [];

    if (sample.length > 0) {
      const numericRatio = numericCount / sample.length;
      const boolRatio = boolCount / sample.length;
      const dtRatio = dtCount / sample.length;
      if (numericRatio > 0.9) {
        type = 'numerical';
        dtype = 'float64';
      } else if (boolRatio > 0.95 && unique <= 3) {
        type = 'boolean';
        dtype = 'bool';
      } else if (dtRatio > 0.8) {
        type = 'datetime';
        dtype = 'datetime64';
      } else if (unique === rows.length && rows.length > 5) {
        type = 'id';
        dtype = 'object';
        warnings.push('Likely a unique identifier — should be excluded from training.');
      } else if (unique > sample.length * 0.5 && unique > 30) {
        type = 'text';
        dtype = 'object';
        warnings.push('High-cardinality text — consider hashing or TF-IDF encoding.');
      } else {
        type = 'categorical';
        dtype = 'object';
      }
    }

    if (targetColumn && name === targetColumn) {
      type = 'target';
    }
    if (missing / Math.max(rows.length, 1) > 0.4) {
      warnings.push(`High missing rate (${((missing / Math.max(rows.length, 1)) * 100).toFixed(1)}%).`);
    }
    if (type === 'categorical' && unique > 50) {
      warnings.push(`High cardinality (${unique} unique values) — may explode one-hot encoding.`);
    }
    if (unique === 1) {
      warnings.push('Constant column — no information, will be dropped.');
    } else if (unique === 2 && type !== 'boolean') {

    }

    const col: ColumnSchema = {
      name,
      type,
      role: targetColumn && name === targetColumn ? 'target' : type === 'id' ? 'id' : 'feature',
      dtype,
      missing,
      missingPct: (missing / Math.max(rows.length, 1)) * 100,
      unique,
      examples: Array.from(new Set(values)).slice(0, 5).map(String),
      warnings,
    };

    if (type === 'numerical' || type === 'target') {
      const nums = values.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      if (nums.length) {
        const sorted = [...nums].sort((a, b) => a - b);
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
        const std = Math.sqrt(variance);
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const skew = std > 0 ? (3 * (mean - median)) / std : 0;
        col.min = min;
        col.max = max;
        col.mean = mean;
        col.median = median;
        col.std = std;
        col.skew = skew;
        if (Math.abs(skew) > 2) {
          col.warnings.push(`Skewed distribution (skew=${skew.toFixed(2)}) — consider log/Box-Cox transform.`);
        }
      }
    }

    if (type === 'categorical' || (type === 'target' && unique <= 30)) {
      const counts = new Map<string, number>();
      for (const v of values) counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
      const top = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([value, count]) => ({ value, count, pct: (count / values.length) * 100 }));
      col.topCategories = top;
      if (top[0] && top[0].pct > 95) {
        col.warnings.push(`Quasi-constant — "${top[0].value}" covers ${top[0].pct.toFixed(1)}%.`);
      }
    }

    return col;
  });
}

function buildProfile(
  headers: string[],
  rows: Record<string, string | number | boolean | null>[],
  schema: ColumnSchema[],
): DataProfile {
  const seen = new Set<string>();
  let duplicateRows = 0;
  for (const r of rows) {
    const key = JSON.stringify(headers.map((h) => r[h]));
    if (seen.has(key)) duplicateRows++;
    else seen.add(key);
  }

  const constantColumns = schema.filter((c) => c.unique === 1).map((c) => c.name);
  const quasiConstantColumns = schema
    .filter((c) => c.topCategories && c.topCategories[0] && c.topCategories[0].pct > 95)
    .map((c) => c.name);
  const highCardinalityColumns = schema.filter((c) => c.unique > 50 && c.type === 'categorical').map((c) => c.name);
  const skewedColumns = schema.filter((c) => c.skew !== undefined && Math.abs(c.skew) > 2).map((c) => c.name);


  const numericalCols = schema.filter((c) => c.type === 'numerical').map((c) => c.name);
  const correlatedPairs: { a: string; b: string; corr: number }[] = [];
  for (let i = 0; i < numericalCols.length; i++) {
    for (let j = i + 1; j < numericalCols.length; j++) {
      const a = numericalCols[i];
      const b = numericalCols[j];
      const corr = pearson(rows.map((r) => [Number(r[a]), Number(r[b])]).filter((p) => !Number.isNaN(p[0]) && !Number.isNaN(p[1])));
      if (Math.abs(corr) > 0.85) {
        correlatedPairs.push({ a, b, corr });
      }
    }
  }



  let targetCandidate: string | null = null;
  let taskType: TaskType | null = null;
  let classificationSubtype: ClassificationSubtype | undefined;
  let targetClasses: string[] | undefined;

  const candidates = schema.filter(
    (c) => c.type === 'categorical' || c.type === 'boolean' || (c.type === 'numerical' && c.unique <= 10),
  );
  if (candidates.length) {

    const target = candidates[candidates.length - 1];
    targetCandidate = target.name;
    if (target.unique <= 10) {
      taskType = 'classification';
      classificationSubtype = target.unique === 2 ? 'binary' : 'multiclass';

      if (target.topCategories && target.topCategories.length > 0) {
        targetClasses = target.topCategories.map((t) => t.value);
      } else {

        const vals = new Set<string>();
        for (const r of rows) {
          const v = r[target.name];
          if (v !== null && v !== '') vals.add(String(v));
        }
        targetClasses = Array.from(vals).sort();
      }
    } else {
      taskType = 'regression';
    }
  } else if (schema.length) {
    targetCandidate = schema[schema.length - 1].name;
    taskType = schema[schema.length - 1].type === 'numerical' ? 'regression' : 'classification';
  }

  const missingTotal = schema.reduce((s, c) => s + c.missing, 0);
  const memoryMb = (rows.length * headers.length * 8) / (1024 * 1024);

  return {
    rowCount: rows.length,
    colCount: headers.length,
    duplicateRows,
    constantColumns,
    quasiConstantColumns,
    highCardinalityColumns,
    skewedColumns,
    correlatedPairs,
    missingTotal,
    memoryMb,
    targetCandidate,
    taskType,
    classificationSubtype,
    targetClasses,
  };
}

function pearson(pairs: number[][]): number {
  if (pairs.length < 3) return 0;
  const n = pairs.length;
  const sx = pairs.reduce((s, p) => s + p[0], 0);
  const sy = pairs.reduce((s, p) => s + p[1], 0);
  const mx = sx / n;
  const my = sy / n;
  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (const [x, y] of pairs) {
    cov += (x - mx) * (y - my);
    vx += (x - mx) ** 2;
    vy += (y - my) ** 2;
  }
  if (vx === 0 || vy === 0) return 0;
  return cov / Math.sqrt(vx * vy);
}




export function generateTitanicLike(): string {
  const headers = ['passenger_id', 'pclass', 'sex', 'age', 'sibsp', 'parch', 'fare', 'embarked', 'survived'];
  const lines = [headers.join(',')];
  const rng = mulberry32(42);
  const embarkPorts = ['S', 'C', 'Q'];
  for (let i = 1; i <= 220; i++) {
    const pclass = 1 + Math.floor(rng() * 3);
    const sex = rng() > 0.5 ? 'male' : 'female';
    const age = Math.round(60 * rng());
    const sibsp = Math.floor(rng() * 4);
    const parch = Math.floor(rng() * 3);
    const fare = +(pclass * 20 + rng() * 80).toFixed(2);
    const embarked = embarkPorts[Math.floor(rng() * 3)];

    const survivalProb = (sex === 'female' ? 0.7 : 0.2) + (pclass === 1 ? 0.2 : 0) - (pclass === 3 ? 0.1 : 0);
    const survived = rng() < survivalProb ? 1 : 0;

    const ageStr = rng() > 0.85 ? '' : String(age);
    const embarkedStr = rng() > 0.95 ? '' : embarked;
    lines.push([`P${1000 + i}`, String(pclass), sex, ageStr, String(sibsp), String(parch), String(fare), embarkedStr, String(survived)].join(','));
  }
  return lines.join('\n');
}

export function generateHousePrice(): string {
  const headers = ['square_feet', 'bedrooms', 'bathrooms', 'year_built', 'garage', 'lot_size', 'neighborhood', 'house_price'];
  const lines = [headers.join(',')];
  const rng = mulberry32(7);
  const neighborhoods = ['Downtown', 'Suburb', 'Riverside', 'Hilltop', 'Industrial'];
  for (let i = 0; i < 250; i++) {
    const sqft = Math.round(800 + rng() * 3500);
    const bedrooms = 1 + Math.floor(rng() * 5);
    const bathrooms = 1 + Math.floor(rng() * 4);
    const year = 1920 + Math.floor(rng() * 104);
    const garage = rng() > 0.4 ? 1 : 0;
    const lot = Math.round(2000 + rng() * 12000);
    const nb = neighborhoods[Math.floor(rng() * neighborhoods.length)];
    const price = Math.round(
      sqft * 180 + bedrooms * 12000 + bathrooms * 8000 + (year - 1920) * 350 + garage * 8000 + lot * 4 + (nb === 'Downtown' ? 60000 : nb === 'Riverside' ? 40000 : 0) + (rng() - 0.5) * 40000,
    );
    lines.push([String(sqft), String(bedrooms), String(bathrooms), String(year), String(garage), String(lot), nb, String(price)].join(','));
  }
  return lines.join('\n');
}

export function generateCustomerChurn(): string {
  const headers = ['customer_id', 'tenure_months', 'monthly_charges', 'total_charges', 'contract', 'internet_service', 'tech_support', 'paperless_billing', 'senior_citizen', 'churn'];
  const lines = [headers.join(',')];
  const rng = mulberry32(99);
  const contracts = ['Month-to-month', 'One year', 'Two year'];
  const internet = ['DSL', 'Fiber optic', 'No'];
  for (let i = 0; i < 300; i++) {
    const tenure = Math.floor(rng() * 72);
    const monthly = +(20 + rng() * 100).toFixed(2);
    const total = +(monthly * Math.max(tenure, 1)).toFixed(2);
    const contract = contracts[Math.floor(rng() * 3)];
    const inet = internet[Math.floor(rng() * 3)];
    const tech = rng() > 0.6 ? 'Yes' : 'No';
    const paper = rng() > 0.4 ? 'Yes' : 'No';
    const senior = rng() > 0.85 ? 1 : 0;

    let pChurn = 0.25;
    if (contract === 'Month-to-month') pChurn += 0.25;
    if (contract === 'Two year') pChurn -= 0.2;
    if (tech === 'No') pChurn += 0.1;
    if (tenure < 12) pChurn += 0.15;
    if (inet === 'Fiber optic') pChurn += 0.1;
    pChurn = Math.max(0.05, Math.min(0.85, pChurn));
    const churn = rng() < pChurn ? 'Yes' : 'No';
    lines.push([`C${10000 + i}`, String(tenure), String(monthly), String(total), contract, inet, tech, paper, String(senior), churn].join(','));
  }
  return lines.join('\n');
}

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
