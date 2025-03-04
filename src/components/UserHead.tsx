"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface UserHeadProps {
    onLinkClick?: () => void;
}

export default function UserHead({ onLinkClick }: UserHeadProps) {
    const { data: session, status } = useSession();
    if (status === "loading") return null;

    return (
        <div className="flex items-center space-x-6">
            {session ? (
                <>
                    <Link
                        href="/profile"
                        className="font-medium text-gray-800 hover:text-themecolor transition-colors duration-200"
                    >
                        {session.user?.name}
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-sm font-semibold text-themecolor hover:text-themecolorhover transition-colors duration-200 px-3 py-1 rounded-md hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <Link
                    href="/signin"
                    className="text-sm font-semibold text-themecolor hover:text-themecolorhover transition-colors duration-200 px-3 py-1 rounded-md hover:bg-gray-100"
                    onClick={onLinkClick}
                >
                    Login
                </Link>
            )}
        </div>
    );
}