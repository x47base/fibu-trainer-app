import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { z } from "zod";
import clientPromise from "@/lib/db";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { saltAndHashPassword, comparePassword } from "@/utils/password";

const signInSchema = z.object({
    email: z.string({ required_error: "Email is required" }).min(1, "Email is required").email("Invalid email"),
    password: z.string({ required_error: "Password is required" }).min(1, "Password is required").min(8, "Password must be more than 8 characters").max(32, "Password must be less than 32 characters"),
});

interface CredentialsInterface {
    email: string;
    password: string;
    name?: string;
}

const adapter = MongoDBAdapter(clientPromise);

export default {
    pages: {
        signIn: "/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
                const parseResult = signInSchema.safeParse(credentials);
                if (!parseResult.success) {
                    throw new Error(parseResult.error.flatten().fieldErrors.email?.[0] || parseResult.error.flatten().fieldErrors.password?.[0] || "Invalid credentials");
                }
                const { email, password } = parseResult.data;
                const pwHash = saltAndHashPassword(password);

                let user = await adapter!.getUserByEmail(email);
                if (!user) {
                    user = await adapter!.createUser({
                        name: (credentials as CredentialsInterface).name || "User",
                        email,
                        emailVerified: null,
                        image: null,
                        password: pwHash,
                    });
                }

                if (!comparePassword(password, (user as { password: string }).password)) {
                    throw new Error("Invalid password");
                }

                return user;
            },
        }),
    ],
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email; // Pass email instead of customId
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.email) {
                session.user.email = token.email; // Use email in session
            }
            return session;
        },
    },
} satisfies NextAuthConfig;