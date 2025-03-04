import { DefaultSession } from "next-auth";
import { ObjectId } from "mongodb";

declare module "next-auth" {
    interface User {
        _id: ObjectId;
        email: string;
        name?: string | null;
        image?: string | null;
        password?: string;
    }
    interface Session {
        user: {
            email: string; // Use email instead of id
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        email: string; // Use email instead of id
    }
}