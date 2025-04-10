const DISCORD_API_URL = 'https://discord.com/api/v10';
const DSKDAO_SERVER_ID = '987406227875196928';

interface DiscordGuildMember {
  roles: string[];
  nick: string | null;
  avatar: string | null;
  joined_at: string;
}

export async function getUserGuildRoles(accessToken: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${DISCORD_API_URL}/users/@me/guilds/${DSKDAO_SERVER_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Discord roles');
    }

    const data = await response.json();
    return data.roles || [];
  } catch (error) {
    console.error('Error fetching Discord roles:', error);
    throw error;
  }
}

export async function getUserGuildMember(accessToken: string): Promise<DiscordGuildMember> {
  if (!DSKDAO_SERVER_ID) {
    throw new Error('Discord Guild ID is not configured');
  }

  try {
    const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds/${DSKDAO_SERVER_ID}/member`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid Discord token');
      }
      throw new Error(`Failed to fetch Discord member data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Discord member data:', error);
    throw error;
  }
} 