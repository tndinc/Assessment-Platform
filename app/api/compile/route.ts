// app/api/compile/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_JDOODLE_CLIENT_SECRET,
        script: body.script,
        language: 'java',
        versionIndex: '4'
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Compilation failed', details: error.message },
      { status: 500 }
    );
  }
}