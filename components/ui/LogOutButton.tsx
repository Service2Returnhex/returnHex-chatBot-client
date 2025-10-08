"use client";

import axios from "axios";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onLogout = async () => {
        try {
            setLoading(true);

            // only run in browser
            if (typeof window === "undefined") return;

            const token = typeof window !== "undefined"
                ? localStorage.getItem("accessToken") : null;

            // If token absent, just clear and navigate
            if (!token) {
                typeof window !== "undefined"
                    ? localStorage.clear() : null;
                router.replace("/login");
                return;
            }

            // IMPORTANT: headers are the third argument to axios.post
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`,
                {}, // no body
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                    withCredentials: true, // if your API uses cookies
                    timeout: 10_000,
                }
            );

            // Clear client storage
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("authToken");
                localStorage.removeItem("pageId");
                localStorage.removeItem("user");
                localStorage.removeItem("webHookURL");
            }


            toast.success("Logged out");
            router.replace("/login");
        } catch (err: any) {
            console.error("Logout error:", err?.response ?? err);
            // Clear local storage anyway
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("authToken");
                localStorage.removeItem("pageId");
                localStorage.removeItem("user");
                localStorage.removeItem("webHookURL");
            }
            // If backend failed to clear cookie, you may need an additional call or server handling
            toast.warn("window undefined, redirecting to login.");
            router.replace("/login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={onLogout}
            aria-label="Logout"
            disabled={loading}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-semibold border border-white/20 hover:bg-white/8 transition bg-transparent text-sm sm:text-base"
        >
            <LogOut className="h-5 w-5" />
            <span>{loading ? "Logging out…" : "Logout"}</span>
        </button>
    );
}
