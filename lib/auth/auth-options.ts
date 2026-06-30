import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { department: true },
        });

        if (!user || !user.password_hash) {
          throw new Error("Invalid email or password");
        }

        if (!user.is_active) {
          throw new Error(
            "Your account has been deactivated. Please contact HR.",
          );
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );
        if (!isValid) {
          await prisma.loginAttempt.create({
            data: {
              email: credentials.email.toLowerCase(),
              user_id: user.id,
              success: false,
            },
          });
          throw new Error("Invalid email or password");
        }

        await prisma.loginAttempt.create({
          data: {
            email: credentials.email.toLowerCase(),
            user_id: user.id,
            success: true,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          departmentId: user.department_id,
          departmentName: user.department.name,
          position: user.position,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
        token.departmentName = user.departmentName;
        token.position = user.position;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.departmentId = token.departmentId as string;
        session.user.departmentName = token.departmentName as string;
        session.user.position = token.position as string | null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },
  jwt: {
    maxAge: 15 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
