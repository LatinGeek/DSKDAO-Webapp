const DISCORD_API_URL = 'https://discord.com/api/v10';
const DSKDAO_SERVER_ID = '987406227875196928';
const BOT_TOKEN = process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN;

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface GuildMember {
  roles: string[];
  nick: string | null;
}

export async function getGuildRoles(): Promise<DiscordRole[]> {
  try {
    const response = await fetch('/api/discord/roles');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch guild roles');
    }

    const roles: DiscordRole[] = await response.json();
    return roles;
  } catch (error) {
    console.error('Error fetching guild roles:', error);
    throw error;
  }
}

export async function getUserGuildMember(accessToken: string): Promise<GuildMember> {
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
      throw new Error('Failed to fetch guild member');
    }

    const member: GuildMember = await response.json();
    return member;
  } catch (error) {
    console.error('Error fetching guild member:', error);
    throw error;
  }
} 