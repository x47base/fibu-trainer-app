import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
        return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("tasks");

        const task = await collection.findOne({ _id: taskId });
        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }
        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error("Error in GET handler:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
        return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }
    try {
        const updatedTask = await request.json();
        if (updatedTask._id && updatedTask._id !== taskId) {
            return NextResponse.json({ message: "Cannot change task ID" }, { status: 400 });
        }
        const { _id, ...taskData } = updatedTask;
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("tasks");

        const result = await collection.updateOne(
            { _id: taskId },
            { $set: taskData }
        );
        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }
        return NextResponse.json(
            { message: "Task updated", task: { _id: taskId, ...taskData } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in PUT handler:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
        return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("tasks");

        const result = await collection.deleteOne({ _id: taskId });
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Task deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE handler:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}