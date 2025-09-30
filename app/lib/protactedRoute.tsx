// "use client";

// import { JwtPayload } from "@/types/jwtPayload.type";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { useRouter } from "next/navigation";
// import React, { PropsWithChildren, useEffect, useState } from "react";

// type JwtPayloadLike = {
//     userId?: string;
//     role?: string;
//     exp?: number; // seconds since epoch
//     [k: string]: any;
// };

// type Props = {
//     allowedRoles?: string[];               // if provided, user's role must be one of these
//     redirectTo?: string;                  // default: "/login"
//     unauthorizedRedirect?: string;        // default: "/unauthorized"
//     validateWithServer?: boolean;         // default: true - calls /auth/me to verify token
//     children?: React.ReactNode;
// };

// export default function ProtectedRoute({
//     children,
//     allowedRoles = [],
//     redirectTo = "/login",
//     unauthorizedRedirect = "/unauthorized",
//     validateWithServer = true,
// }: PropsWithChildren<Props>) {
//     const router = useRouter();
//     const [ready, setReady] = useState(false); // true => allow render children
//     const [checking, setChecking] = useState(true);

//     useEffect(() => {
//         // Only run on client
//         if (typeof window === "undefined") return;

//         let mounted = true;
//         (async () => {
//             try {
//                 const token = localStorage.getItem("accessToken");

//                 if (!token) {
//                     // no token -> redirect to login
//                     router.replace(redirectTo);
//                     return;
//                 }

//                 // quick decode to check expiry & possible role
//                 let decoded: JwtPayload | null = null;
//                 let userId: "";
//                 try {
//                     decoded = jwtDecode<JwtPayload>(token);
//                     userId = decoded.userId;
//                 } catch (e) {
//                     // invalid token format -> clear and redirect
//                     localStorage.removeItem("accessToken");
//                     router.replace(redirectTo);
//                     return;
//                 }

//                 // expiry check (exp in seconds)
//                 if (decoded?.exp && typeof decoded.exp === "number") {
//                     const nowSec = Math.floor(Date.now() / 1000);
//                     if (decoded.exp < nowSec) {
//                         localStorage.removeItem("accessToken");
//                         router.replace(redirectTo);
//                         return;
//                     }
//                 }

//                 // If allowedRoles provided, try client-side role check first.
//                 const storedUserRole = (() => {
//                     try {
//                         const raw = localStorage.getItem("user");
//                         if (!raw) return (decoded?.role as string | undefined) ?? undefined;
//                         // 'user' might be a JSON string or a plain role string
//                         // try parse, otherwise return raw
//                         try {
//                             const parsed = JSON.parse(raw);
//                             // parsed could be an object or string. prefer parsed.role
//                             if (parsed && typeof parsed === "object" && parsed.role) return parsed.role;
//                             if (typeof parsed === "string") return parsed;
//                         } catch {
//                             // not JSON -> maybe plain role string
//                             return raw;
//                         }
//                         return (decoded?.role as string | undefined) ?? undefined;
//                     } catch {
//                         return (decoded?.role as string | undefined) ?? undefined;
//                     }
//                 })();

//                 if (allowedRoles.length > 0) {
//                     const roleToCheck = storedUserRole ?? decoded?.role;
//                     if (!roleToCheck || !allowedRoles.includes(roleToCheck)) {
//                         // role mismatch -> redirect to unauthorized
//                         router.replace(unauthorizedRedirect);
//                         return;
//                     }
//                 }

//                 // Optional server validation: call /auth/me to ensure token not revoked/blacklisted
//                 if (validateWithServer) {
//                     try {
//                         const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//                         await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users`, {
//                             headers: { Authorization: `${token}` },
//                             timeout: 5000,
//                         });
//                         // success -> token valid
//                     } catch (err) {
//                         // server rejected the token -> logout and redirect
//                         localStorage.removeItem("accessToken");
//                         localStorage.removeItem("user");
//                         router.replace(redirectTo);
//                         return;
//                     }
//                 }

//                 // passed all checks
//                 if (mounted) {
//                     setReady(true);
//                 }
//             } catch (err) {
//                 console.error("ProtectedRoute error:", err);
//                 localStorage.removeItem("accessToken");
//                 localStorage.removeItem("user");
//                 router.replace(redirectTo);
//             } finally {
//                 if (mounted) setChecking(false);
//             }
//         })();

//         return () => {
//             mounted = false;
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // while we check, render a minimal loader to avoid flicker
//     if (!ready) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div>
//                     {checking ? (
//                         <div className="text-gray-400">Checking authentication…</div>
//                     ) : (
//                         <div className="text-gray-400">Redirecting…</div>
//                     )}
//                 </div>
//             </div>
//         );
//     }

//     return <>{children}</>;
// }
