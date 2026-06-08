import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isDemo: { label: "Demo Login", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) throw new Error("Email is required");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) throw new Error("User not found");

        if (credentials.isDemo === "true") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          };
        }

        if (!credentials.password) throw new Error("Password required");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // login time
      if (user) {
        token.id = user.id;
      }

      // 🔥 ALWAYS FETCH FRESH DATA FROM DB (MAIN FIX)
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id }
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};