"use client";

import {
  BarChart2,
  Bot,
  Brain,
  Home,
  MessageSquare,
  Package,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const nav: NavItem[] = [
  {
    href: "/admin-dashboard",
    label: "Overview",
    icon: <Home className="w-5 h-5" />,
  },
  // {
  //   href: "/user-dashboard/pages",
  //   label: "Pages",
  //   icon: <LayoutGrid className="w-5 h-5" />,
  // },
  {
    href: "/admin-dashboard/token-usage",
    label: "Token Usage",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    href: "/admin-dashboard/pages",
    label: "Pages",
    icon: <Package className="w-5 h-5" />,
  },
  {
    href: "/admin-dashboard/configure-bot",
    label: "Configuration Bot",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    href: "/admin-dashboard/update-pageInfo",
    label: "Update PageInfo",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    href: "/admin-dashboard/train-post",
    label: "Train Posts",
    icon: <Bot className="w-5 h-5" />,
  },
  {
    href: "/admin-dashboard/train-prompt",
    label: "Train Prompt",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  //   {
  //     href: "/change-password",
  //     label: "Change Password",
  //     icon: <Shield className="w-5 h-5" />,
  //   },
];

type Props = {
  userName?: string;
  userEmail?: string;
  availableTokens?: number;
  onSignOut?: () => void;
  className?: string;
};
const normalize = (p?: string) =>
  p ? p.replace(/\/+$/, "").toLowerCase() : "";
export default function AdminSidebar({
  userName = "Admin",
  userEmail,
}: Props) {
  const pathname = usePathname() ?? "";
  const np = normalize(pathname);

  const activeHref = useMemo(() => {
    const matches = nav
      .map((item) => ({
        ...item,
        nh: normalize(item.href),
      }))
      .filter(
        (item) => item.nh && (np === item.nh || np.startsWith(item.nh + "/"))
      );

    if (matches.length === 0) return "";

    // sort by length of nh descending, take first
    matches.sort((a, b) => b.nh.length - a.nh.length);
    return matches[0].nh;
  }, [np]);

  return (
    <aside
      className={`w-72 bg-gradient-to-b from-white/3 to-white/2 backdrop-blur-md p-4 rounded-2xl min-h-screen fixed `}
      aria-label="Admin sidebar"
    >
      {/* User info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white font-medium">
          {userName
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {userName}
          </div>
          <div className="text-xs text-gray-300 truncate">{userEmail}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-3" aria-label="Main">
        {nav.map((item) => {
          const nh = normalize(item.href);
          const active = nh !== "" && nh === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-1  md:py-2 rounded-lg text-sm transition 
                ${active
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-200 hover:bg-white/5"
                }
              `}
            >
              <span className={`${active ? "text-white" : "text-gray-300"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <Link href={"/"} className="bottom-2 fixed flex gap-4 justify-center items-center">
          <Image
            src="/botHex3.jpg"
            height={36}
            width={36}
            alt="home"
            className="rounded w-8 md:w-10"
          />
          <span>Home</span>
        </Link>
      </nav>
    </aside>
  );
}
