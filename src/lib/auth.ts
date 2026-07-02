import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// NextAuth 配置：
// - 使用邮箱 + 密码凭证登录
// - 通过 Prisma 查询用户，bcryptjs 校验密码
// - 采用 JWT 会话策略，无需 Adapter 表
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        // 入参缺失直接拒绝
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 通过 Prisma 按邮箱查询用户
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // 用户不存在或未设置密码（如仅 OAuth 用户）时返回 null
        if (!user || !user.passwordHash) {
          return null;
        }

        // bcryptjs 校验密码，不匹配返回 null
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) {
          return null;
        }

        // 返回写入 token 的用户信息
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    // JWT 回调：登录时将 userId 写入 token
    async jwt({ token, user }) {
      if (user) {
        (token as { userId?: string }).userId = user.id;
      }
      return token;
    },
    // Session 回调：将 userId 暴露到客户端 session
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (
          token as { userId?: string }
        ).userId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
