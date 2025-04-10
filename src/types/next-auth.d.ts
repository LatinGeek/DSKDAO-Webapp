import 'next-auth';
import { JWT } from 'next-auth/jwt';
import NextAuth from "next-auth"

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      discordAccessToken?: string | null;
    };
  }

  interface Profile {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    discordId?: string;
  }
} 