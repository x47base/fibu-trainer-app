import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

async function getTasks() {
    const client = await clientPromise;
    const db = client.db();
    const tasks = await db.collection("tasks").find({}).toArray();
    return tasks;
}

export async function GET() {
    try {
        const tasks = await getTasks();
        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Error in GET /api/tasks:", error);
        return NextResponse.error();
    }
}

export async function POST(request: Request) {
    try {
        const reqBody = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const tasksCollection = db.collection("tasks");

        const maxIdTask = await tasksCollection.findOne({}, { sort: { _id: -1 } });
        const newId = maxIdTask ? maxIdTask._id + 1 : 1;

        const task = { ...reqBody, _id: newId, createdAt: new Date().toISOString() };
        await tasksCollection.insertOne(task);
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/tasks:", error);
        return NextResponse.error();
    }
}
