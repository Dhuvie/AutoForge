

import { NextRequest, NextResponse } from 'next/server';
import {
  generateCustomerChurn,
  generateHousePrice,
  generateTitanicLike,
  parseCsv,
} from '@/lib/csv';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sample = formData.get('sample') as string | null;

    let text: string;
    let filename: string;

    if (sample) {
      switch (sample) {
        case 'titanic':
          text = generateTitanicLike();
          filename = 'titanic_sample.csv';
          break;
        case 'house_prices':
          text = generateHousePrice();
          filename = 'house_prices_sample.csv';
          break;
        case 'customer_churn':
          text = generateCustomerChurn();
          filename = 'customer_churn_sample.csv';
          break;
        default:
          return NextResponse.json({ error: `Unknown sample dataset: ${sample}` }, { status: 400 });
      }
    } else if (file) {
      text = await file.text();
      filename = file.name;
    } else {
      return NextResponse.json({ error: 'No file or sample provided.' }, { status: 400 });
    }

    if (text.length > 5_000_000) {
      return NextResponse.json({ error: 'Dataset exceeds 5MB limit.' }, { status: 413 });
    }

    const parsed = parseCsv(text, { maxRows: 5000 });
    return NextResponse.json({
      filename,
      columns: parsed.columns,
      rows: parsed.rows,
      schema: parsed.schema,
      profile: parsed.profile,
      head: parsed.head,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
