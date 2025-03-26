"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Buchung, { Validate } from "@/components/aufgaben/Buchung";

export default function TrainPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        // @ts-expect-error: status should be a property.
        if (!session || status === "unauthenticated") {
            router.push("/signin");
        }
    }, [session, status, router]);

    if (status === "loading") return <div>Loading... Refresh if screen stays.</div>;

    return (
        <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 mt-12">
            {/* Base page with nothing */}
            <Buchung taskId={1} />
        </div>
    );
}