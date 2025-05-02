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
            { projection: { exams: 1, _id: 0 } }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.exams || [], { status: 200 });
    } catch (error) {
        console.error("Error fetching exam results:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const examData = await request.json();
        if (
            !examData ||
            typeof examData.correct !== "number" ||
            typeof examData.maxPoints !== "number" ||
            typeof examData.percentage !== "number" ||
            typeof examData.grade !== "number" ||
            !Array.isArray(examData.tasks)
        ) {
            return NextResponse.json({ message: "Invalid exam data" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("users").findOne(
            { email: session.user.email },
            { projection: { exams: 1, totalTasksSolved: 1, examsTaken: 1, averageAccuracy: 1, averageExamScore: 1, bestExamScore: 1 } }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const newExams = [...(user.exams || []), examData];
        const totalTasks = newExams.reduce((sum, exam) => sum + exam.maxPoints, 0);
        const totalCorrect = newExams.reduce((sum, exam) => sum + exam.correct, 0);
        const averageAccuracy = totalTasks > 0 ? (totalCorrect / totalTasks) * 100 : 0;
        const averageExamScore = newExams.length > 0 ? newExams.reduce((sum, exam) => sum + exam.percentage, 0) / newExams.length : 0;
        const bestExamScore = newExams.length > 0 ? Math.max(...newExams.map((exam) => exam.percentage)) : examData.percentage;

        const result = await db.collection("users").updateOne(
            { email: session.user.email },
            {
                $push: { exams: examData },
                $inc: { examsTaken: 1, totalTasksSolved: examData.correct },
                $set: {
                    averageAccuracy,
                    averageExamScore,
                    bestExamScore
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Exam results saved" }, { status: 200 });
    } catch (error) {
        console.error("Error saving exam results:", error);
        return NextResponse.json({ message: `Internal server error: ${error.message}` }, { status: 500 });
    }
}