import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

const VALID_TASK_TYPES = ["booking", "drag-drop", "multiple-choice", "text"];

const TASK_TYPE_MAP: Record<string, string> = {
    kreuze: "drag-drop",
    buchungen: "booking",
    lueckentext: "text",
    "multiple-choice": "multiple-choice",
};

export async function GET(request: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const taskType = searchParams.get("type");
        const taskTypes = searchParams.get("types");
        const tags = searchParams.get("tags");
        const getTags = searchParams.get("tags") === "true";

        let types: string[] | undefined;
        if (taskTypes) {
            types = taskTypes.split(",").map((t) => {
                const type = t.trim().toLowerCase();
                return TASK_TYPE_MAP[type] || type;
            });
            const invalidTypes = types.filter((t) => !VALID_TASK_TYPES.includes(t));
            if (invalidTypes.length > 0) {
                return NextResponse.json(
                    { message: `Invalid task types: ${invalidTypes.join(", ")}. Must be one of: ${VALID_TASK_TYPES.join(", ")}` },
                    { status: 400 }
                );
            }
        } else if (taskType) {
            const mappedType = TASK_TYPE_MAP[taskType.toLowerCase()] || taskType;
            if (!VALID_TASK_TYPES.includes(mappedType)) {
                return NextResponse.json(
                    { message: `Invalid task type: ${mappedType}. Must be one of: ${VALID_TASK_TYPES.join(", ")}` },
                    { status: 400 }
                );
            }
            types = [mappedType];
        }

        if (getTags) {
            const client = await clientPromise;
            const db = client.db();
            const tasks = await db.collection("tasks").find({}).toArray();
            const allTags = new Set<string>();
            tasks.forEach((task: any) => {
                task.tags?.forEach((tag: string) => allTags.add(tag));
            });
            return NextResponse.json(Array.from(allTags), { status: 200 });
        }

        const client = await clientPromise;
        const db = client.db();
        const query: any = {};

        if (types && types.length > 0) {
            query.type = { $in: types };
        }
        if (tags) {
            const tagArray = tags.split(",").map((tag) => tag.trim());
            query.tags = { $all: tagArray };
        }

        const tasks = await db
            .collection("tasks")
            .find(
                session.user.role === "admin"
                    ? { ...query }
                    : { $or: [{ isPublic: true }, { createdBy: session.user.email }], ...query }
            )
            .toArray();

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/tasks:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const reqBody = await request.json();

        if (!reqBody.type || !VALID_TASK_TYPES.includes(reqBody.type)) {
            return NextResponse.json(
                { message: `Invalid task type. Must be one of: ${VALID_TASK_TYPES.join(", ")}` },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const tasksCollection = db.collection("tasks");

        const highestTask = await tasksCollection
            .find({})
            .sort({ _id: -1 })
            .limit(1)
            .toArray();
        const highestId = highestTask.length > 0 ? highestTask[0]._id : 0;

        await db.collection("counters").updateOne(
            { _id: "taskId" },
            { $max: { seq: highestId + 1 } },
            { upsert: true }
        );

        const counter = await db.collection("counters").findOneAndUpdate(
            { _id: "taskId" },
            { $inc: { seq: 1 } },
            { upsert: true, returnDocument: "after" }
        );
        const newId = counter?.value?.seq || highestId + 1;

        const isPublic = reqBody.isPublic !== undefined ? reqBody.isPublic : session.user.role === "admin";
        const createdBy = isPublic && session.user.role === "admin" ? "N/A" : session.user.email;

        const task = {
            ...reqBody,
            isPublic,
            createdBy,
            _id: newId,
            createdAt: new Date().toISOString(),
        };

        await tasksCollection.insertOne(task);
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/tasks:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}