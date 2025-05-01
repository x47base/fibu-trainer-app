import { DefaultSession } from "next-auth";
import { ObjectId } from "mongodb";

declare module "next-auth" {
    interface User {
        _id: ObjectId;
        email: string;
        name?: string | null;
        image?: string | null;
        password?: string;
        admin?: boolean;
        role?: "user" | "admin";
    }

    interface Session {
        user: {
            email: string;
            name?: string | null;
            image?: string | null;
            admin?: boolean;
            role?: "user" | "admin";
        } & DefaultSession["user"];
        status: "authenticated" | "unauthenticated";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        email: string;
        name?: string | null;
        image?: string | null;
        status?: "authenticated" | "unauthenticated";
        admin?: boolean;
        role?: "user" | "admin";
    }
}