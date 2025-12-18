import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  // 1. Change the type definition to wrap params in a Promise
  { params }: { params: Promise<{ player: string }> }
) {
  const API_KEY = process.env.MARVEL_RIVALS_API_KEY;
  const API_VERSION = process.env.MARVEL_RIVALS_API_VERSION || "v1";
  
  // 2. Await the params before using them
  const resolvedParams = await params;
  const username = resolvedParams.player;

  const ENDPOINT = `https://marvelrivalsapi.com/api/${API_VERSION}/player/${username}`;

  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key is missing' }, { status: 500 });
  }
  
  if (!username) {
    return NextResponse.json({ error: 'Player username is missing' }, { status: 400 });
  }

  try {
    const res = await fetch(ENDPOINT, {
      headers: {
        'x-api-key': API_KEY,
      },
      cache: 'no-store', 
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}