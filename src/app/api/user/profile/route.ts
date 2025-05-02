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
            {
                projection: {
                    fullName: 1,
                    examsTaken: 1,
                    totalTasksSolved: 1,
                    averageAccuracy: 1,
                    averageExamScore: 1,
                    bestExamScore: 1,
                    badges: 1,
                    _id: 0
                }
            }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            {
                fullName: user.fullName || session.user.name || "Unbekannter Nutzer",
                examsTaken: user.examsTaken || 0,
                totalTasksSolved: user.totalTasksSolved || 0,
                averageAccuracy: user.averageAccuracy || 0,
                averageExamScore: user.averageExamScore || 0,
                bestExamScore: user.bestExamScore || 0,
                badges: user.badges || []
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
}