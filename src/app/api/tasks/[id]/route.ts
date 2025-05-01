import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

        const isAdmin = session.user.role === "admin";
        const isCreator = task.createdBy === session.user.email;
        if (task.isPublic && !isAdmin) {
            return NextResponse.json({ message: "Only admins can access public tasks" }, { status: 403 });
        }
        if (!task.isPublic && !isCreator) {
            return NextResponse.json({ message: "You can only access your own private tasks" }, { status: 403 });
        }

        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/tasks/[id]:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
        return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }

    try {
        const updatedTask = await request.json();
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("tasks");

        const existingTask = await collection.findOne({ _id: taskId });
        if (!existingTask) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        const isAdmin = session.user.role === "admin";
        const isCreator = existingTask.createdBy === session.user.email;
        
        if (existingTask.isPublic && isAdmin) {
            // admins can edit public tasks
        } else {
            return NextResponse.json({ message: "Only admins can edit public tasks" }, { status: 403 });
        }

        if (!existingTask.isPublic && !isCreator) {
            return NextResponse.json({ message: "You can only edit your own private tasks" }, { status: 403 });
        }

        const { _id, createdBy, ...taskData } = updatedTask;
        const result = await collection.updateOne(
            { _id: taskId },
            { $set: { ...taskData, createdBy: existingTask.createdBy } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Task updated", task: { _id: taskId, createdBy: existingTask.createdBy, ...taskData } },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in PUT /api/tasks/[id]:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
        return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("tasks");

        const existingTask = await collection.findOne({ _id: taskId });
        if (!existingTask) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        const isAdmin = session.user.role === "admin";
        const isCreator = existingTask.createdBy === session.user.email;
        if (existingTask.isPublic && !isAdmin) {
            return NextResponse.json({ message: "Only admins can delete public tasks" }, { status: 403 });
        }
        if (!existingTask.isPublic && !isCreator) {
            return NextResponse.json({ message: "You can only delete your own private tasks" }, { status: 403 });
        }

        const result = await collection.deleteOne({ _id: taskId });
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Task deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/tasks/[id]:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}