"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TrainPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "loading") return;
    }, [session, status, router]);

    if (!mounted) return null;

    const stateData = {
        status: status,
        session: session
    }

    return (
        <div className="container">
            <pre>{JSON.stringify(stateData, null, 2)}</pre>
        </div>
    );
}