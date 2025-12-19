import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ version: string; player: string }> }
) {
  const API_KEY = process.env.MARVEL_RIVALS_API_KEY;
  const API_VERSION = process.env.MARVEL_RIVALS_API_VERSION || "v1";
  
  const resolvedParams = await params;
  const { player: username } = resolvedParams;
  
  const ENDPOINT = `https://marvelrivalsapi.com/api/${API_VERSION}/player/${username}/match-history`;

  if (!API_KEY) return NextResponse.json({ error: 'Key missing' }, { status: 500 });

  try {
    const res = await fetch(ENDPOINT, { headers: { 'x-api-key': API_KEY }, cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status || 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
