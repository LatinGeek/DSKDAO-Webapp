import { NextResponse } from 'next/server';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DSKDAO_SERVER_ID = '987406227875196928';

export async function GET() {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

  if (!BOT_TOKEN) {
    return NextResponse.json(
      { error: 'Discord Bot Token is not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${DISCORD_API_URL}/guilds/${DSKDAO_SERVER_ID}/roles`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
        // Cache the response for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Discord API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch guild roles' },
        { status: response.status }
      );
    }

    const roles = await response.json();
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching guild roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 