"use client";
import { JwtPayload } from "@/types/jwtPayload.type";
import { jwtDecode } from "jwt-decode";
import { Menu } from "lucide-react";
// src/components/Navbar.tsx
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type NavbarProps = {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightNode?: React.ReactNode;
  className?: string;
  bgClass?: string;
};

export default function Navbar({
  showBack = true,
  backHref,
  rightNode,
}: NavbarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string>("")
  const [menuOpen, setMenuOpen] = useState(false);


  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (backHref) {
      // prefer explicit href
      router.push(backHref);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    // check login from localStorage (or cookie, context, JWT, etc.)
    const token = typeof window !== "undefined"
      ? localStorage.getItem("accessToken") : null;
    if (!token) return;
    setIsLoggedIn(!!token);
    const decoded = jwtDecode<JwtPayload>(token);
    const Role = decoded?.role ?? ""
    const userRole = String(Role ?? "").trim().toLowerCase();
    console.log("role", userRole);
    if (userRole == "admin") {
      setRole(userRole)
    }

  }, []);

  return (
    <nav
      aria-label={"navigation"}
      className={`fixed left-0 right-0 top-4 z-50 flex justify-center text-white`}
    >
      <div
        className={`mx-4 w-full max-w-[85%] rounded-2xl px-4 py-2 backdrop-blur-md border border-white/6 shadow-sm flex items-center gap-4 bg-white/15`}
      >
        {/* Left: Back button / Home link */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/8 bg-white/4 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {/* Back arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 16L6 10l6-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <Link
              href="/"
              aria-label="Home"
              className="inline-flex items-center gap-2"
            >
              <div className="h-9 w-9 rounded-lg flex items-center justify-center card-bg text-white font-semibold">
                AI
              </div>
            </Link>
          )}


        </div>

        {/* Center: responsive title for small screens */}
        <div className="flex-1 text-center sm:text-left">
          {/* <h1 className="text-base font-semibold text-white/95 sm:hidden">
            {title}
          </h1> */}
        </div>

        {/* Right: custom actions */}
        <div className="flex items-center gap-3">
          {rightNode ? (
            rightNode
          ) : (
            // default quick links (example)
            <div className="hidden sm:flex items-center gap-3">
              {isLoggedIn && (

                role === "admin" ? (
                  <Link
                    href="/admin-dashboard"
                    className="text-sm px-3 py-2 rounded-lg hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/user-dashboard"
                    className="text-sm px-3 py-2 rounded-lg hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    User Dashboard
                  </Link>
                )

              )}
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="text-sm px-3 py-2 rounded-lg hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Login
                </Link>
              ) : (
                <li
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    setIsLoggedIn(false);
                  }}
                  className="text-sm px-3 py-2 rounded-lg hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Logout
                </li>
              )}
            </div>
          )}
        </div>
        {/* Mobile menu (hamburger) */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-white/10"
          >
            <Menu className="w-6 h-6" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white/15 backdrop-blur-md text-white shadow-lg rounded-lg p-2 z-50">
              {isLoggedIn && (
                <Link
                  href={role === "admin" ? "/admin-dashboard" : "/user-dashboard"}
                  className="block px-3 py-2 text-sm  hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm  hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    setIsLoggedIn(false);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
