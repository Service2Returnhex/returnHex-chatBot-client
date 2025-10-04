"use client"
import { JwtPayload } from '@/types/jwtPayload.type';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function UserName() {
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        // simulate fetch + small delay
        const token = typeof window !== "undefined"
            ? localStorage.getItem("authToken") : null;
        if (!token) return;

        const decoded = jwtDecode<JwtPayload>(token);
        const userId = decoded.userId;

        axios
            .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${userId}`)
            .then((res) => {
                setUserName(res.data.data.name);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to load user");
            });
    }, []);
    return (
        <div>
            <div className="min-w-0 md:flex-1">
                <h1 className="text-lg sm:text-xl xl:text-2 xl  font-bold text-white mb-1 leading-tight truncate">
                    Welcome back,{" "}
                    <span className="text-gradient inline-block max-w-[150px] sm:max-w-[210px] md:max-w-[310px] truncate ">
                        {userName} <span aria-hidden="true">👋</span>
                    </span>
                </h1>

                <p className="text-sm sm:text-base text-gray-300 max-w-prose">
                    Here's an overview of your bot activity and usage statistics.
                </p>
            </div>
        </div>
    )
}
