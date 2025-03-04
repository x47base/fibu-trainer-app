"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
        <div className="">
            {/* Base page with nothing */}
        </div>
    );
}