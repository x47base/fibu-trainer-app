import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const examData = await request.json();
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection("users").updateOne(
            { email: session.user.email },
            { $push: { exams: examData } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Exam results saved" }, { status: 200 });
    } catch (error) {
        console.error("Error saving exam results:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}