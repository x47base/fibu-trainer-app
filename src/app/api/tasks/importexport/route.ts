import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskType = searchParams.get("type");
        const client = await clientPromise;
        const db = client.db();
        const tasks = taskType
            ? await db.collection("tasks").find({ type: taskType }).toArray()
            : await db.collection("tasks").find({}).toArray();
        const json = JSON.stringify(tasks);
        return new NextResponse(json, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": "attachment; filename=tasks.json",
            },
        });
    } catch (error) {
        console.error("Error exporting tasks:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ message: "Payload muss ein Array sein." }, { status: 400 });
        }

        const uniqueTasks = Array.from(new Map(body.map((t: any) => [t._id, t])).values());

        const client = await clientPromise;
        const db = client.db();

        const maxTasks = uniqueTasks.length;
        const counter = await db.collection("counters").findOneAndUpdate(
            { _id: "taskId" },
            { $inc: { seq: maxTasks } },
            { upsert: true, returnDocument: "after" }
        );
        const startId = (counter?.value?.seq || 1) - maxTasks + 1;

        const tasksToInsert = uniqueTasks.map((task: any, index: number) => ({
            ...task,
            _id: startId + index,
            isPublic: task.isPublic !== undefined ? task.isPublic : false,
            createdBy: task.createdBy || "N/A",
            createdAt: new Date().toISOString(),
        }));

        const taskIds = tasksToInsert.map((task: any) => task._id);
        const existingTasks = await db
            .collection("tasks")
            .find({ _id: { $in: taskIds } })
            .project({ _id: 1 })
            .toArray();
        const existingIds = new Set(existingTasks.map((task: any) => task._id));

        const newTasks = tasksToInsert.filter((task: any) => !existingIds.has(task._id));
        if (newTasks.length === 0) {
            return NextResponse.json({ message: "Keine neuen Tasks zum Importieren." }, { status: 200 });
        }

        const result = await db.collection("tasks").insertMany(newTasks);
        const updatedTasks = await db.collection("tasks").find({}).toArray();
        return NextResponse.json(
            {
                message: "Import erfolgreich",
                insertedCount: result.insertedCount,
                tasks: updatedTasks,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error importing tasks:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}