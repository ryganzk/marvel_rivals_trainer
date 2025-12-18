import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.MARVEL_RIVALS_API_KEY;
  const API_VERSION = process.env.MARVEL_RIVALS_API_VERSION || 'v1';
  const ENDPOINT = `https://marvelrivalsapi.com/api/${API_VERSION}/heroes`;

  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key is missing' }, { status: 500 });
  }

  try {
    const res = await fetch(ENDPOINT, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}