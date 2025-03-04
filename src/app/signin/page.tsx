"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/train");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch("/api/auth/csrf");
                const { csrfToken } = await response.json();
                setCsrfToken(csrfToken);
            } catch (error) {
                console.error("Failed to fetch CSRF token:", error);
                setErrorMessage("Could not fetch CSRF token. Please try again.");
            }
        };
        fetchCsrfToken();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!csrfToken) {
            setErrorMessage("CSRF token not available. Please refresh the page.");
            return;
        }

        const result = await signIn("credentials", {
            redirect: false,
            callbackUrl: "/train",
            email,
            password,
            ...(isRegister && { name }),
            csrfToken,
        });

        if (result?.error) {
            setErrorMessage(result.error);
        } else {
            console.log(isRegister ? "Successfully registered" : "Successfully signed in");
            router.push("/train");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-lg z-10 mx-auto"
            >
                <h1 className="text-3xl font-bold text-themecolor text-center mb-6">
                    {isRegister ? "Create Account" : "Sign In"}
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                    {isRegister && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                                placeholder="Your Name"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themecolorhover focus:border-themecolor transition-colors duration-200"
                            placeholder="••••••••"
                        />
                    </div>
                    <input type="hidden" name="csrfToken" value={csrfToken || ""} />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!csrfToken}
                        className="w-full py-3 px-4 bg-themecolor text-white font-semibold rounded-lg shadow-md hover:bg-themecolorhover focus:outline-none focus:ring-2 focus:ring-themecolorhover transition-all duration-200 disabled:bg-gray-400"
                    >
                        {isRegister ? "Register" : "Sign In"}
                    </motion.button>
                </form>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-themecolor font-medium hover:text-themecolorhover hover:underline transition-colors duration-200"
                    >
                        {isRegister ? "Already have an account? Sign In" : "No account? Register"}
                    </button>
                </div>
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-center text-red-500 text-sm"
                    >
                        {errorMessage}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}