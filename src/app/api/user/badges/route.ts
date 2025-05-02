import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne(
            { email: session.user.email },
            { projection: { badges: 1, _id: 0 } }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.badges || [], { status: 200 });
    } catch (error) {
        console.error("Error fetching badges:", error);
        return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { badges } = await request.json();
        if (!Array.isArray(badges) || badges.length === 0) {
            return NextResponse.json({ message: "Invalid badges data" }, { status: 400 });
        }

        for (const badge of badges) {
            if (
                !badge.id ||
                !badge.name ||
                !badge.description ||
                !badge.awardedAt ||
                typeof badge.id !== "string" ||
                typeof badge.name !== "string" ||
                typeof badge.description !== "string" ||
                !Date.parse(badge.awardedAt)
            ) {
                return NextResponse.json({ message: "Invalid badge format" }, { status: 400 });
            }
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection("users").updateOne(
            { email: session.user.email },
            {
                $addToSet: { badges: { $each: badges } }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Badges awarded" }, { status: 200 });
    } catch (error) {
        console.error("Error awarding badges:", error);
        return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
}