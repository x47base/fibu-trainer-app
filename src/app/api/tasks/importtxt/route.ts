import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file || file.type !== "text/plain") {
            return NextResponse.json({ message: "Please upload a valid .txt file" }, { status: 400 });
        }

        const text = await file.text();
        const tasks = parseTxtTasks(text);

        if (tasks.length === 0) {
            return NextResponse.json({ message: "No valid tasks found in the file" }, { status: 400 });
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

        const tasksToInsert = tasks.map((task, index) => ({
            ...task,
            _id: highestId + index + 1,
            isPublic: task.isPublic !== undefined ? task.isPublic : true,
            createdBy: "N/A",
            createdAt: new Date().toISOString(),
        }));

        const taskIds = tasksToInsert.map((task) => task._id);
        const existingTasks = await db
            .collection("tasks")
            .find({ _id: { $in: taskIds } })
            .project({ _id: 1 })
            .toArray();
        const existingIds = new Set(existingTasks.map((task: any) => task._id));

        const newTasks = tasksToInsert.filter((task) => !existingIds.has(task._id));
        if (newTasks.length === 0) {
            return NextResponse.json({ message: "No new tasks to import" }, { status: 200 });
        }

        const result = await tasksCollection.insertMany(newTasks);
        return NextResponse.json(
            {
                message: "Tasks imported successfully",
                insertedCount: result.insertedCount,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error importing tasks:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

function parseTxtTasks(text: string) {
    const tasks: any[] = [];
    const taskBlocks = text.trim().split("===").filter((block) => block.trim());

    for (const block of taskBlocks) {
        const lines = block.trim().split("\n").filter((line) => line.trim());
        const task: any = { content: {} };
        let currentSection: string | null = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("Bookings:")) {
                currentSection = "bookings";
                task.content.bookings = [];
                continue;
            }

            if (currentSection === "bookings" && trimmedLine.match(/^\d+\./)) {
                const bookingMatch = trimmedLine.match(/^\d+\.\s*Soll:\s*([^,]+),\s*Haben:\s*([^,]+),\s*Betrag:\s*(\d+)/);
                if (bookingMatch) {
                    task.content.bookings.push({
                        soll: bookingMatch[1].trim(),
                        haben: bookingMatch[2].trim(),
                        betrag: parseFloat(bookingMatch[3]),
                    });
                }
                continue;
            }

            const [key, value] = trimmedLine.split(":").map((part) => part.trim());
            if (!key || !value) continue;

            switch (key.toLowerCase()) {
                case "type":
                    task.type = value.toLowerCase();
                    break;
                case "scenario":
                case "question":
                case "text":
                case "account":
                case "initialside":
                    task.content[key.toLowerCase()] = value;
                    break;
                case "anfangsbestand":
                case "saldo":
                case "correctanswer":
                    task.content[key.toLowerCase()] = parseFloat(value);
                    break;
                case "tags":
                    task.tags = value.split(",").map((tag) => tag.trim());
                    break;
                case "ispublic":
                    task.isPublic = value.toLowerCase() === "true";
                    break;
                case "options":
                case "soll":
                case "haben":
                case "answers":
                    task.content[key.toLowerCase()] = value.split(",").map((item) => item.trim());
                    break;
            }
        }

        if (task.type && Object.keys(task.content).length > 0) {
            tasks.push(task);
        }
    }

    return tasks;
}