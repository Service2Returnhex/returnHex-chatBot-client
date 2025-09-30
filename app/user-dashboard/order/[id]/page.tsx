"use client"

import { IOrder, OrderStatus } from "@/types/order.type";
import axios from "axios";
import { ArrowLeft, Clipboard, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function page({ params }: any) {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<IOrder | null>(null);
    const [mutating, setMutating] = useState(false);
    const router = useRouter();
    const STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "delivered", "cancelled"];


    useEffect(() => {
        let mounted = true;
        const abortCtrl = new AbortController();

        async function fetchOrder() {
            setLoading(true);
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
                if (!token) {
                    toast.error("Not authenticated");
                    // router.replace("/login");
                    return;
                }

                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/v1/page/shop/order/${encodeURIComponent(params.id)}`,
                    {
                        headers: { Authorization: `${token}` },
                        signal: abortCtrl.signal,
                    }
                );

                if (mounted) {
                    setOrder(res.data?.data ?? null);
                }
            } catch (err: any) {
                if (!axios.isCancel(err)) {
                    console.error("Fetch order error", err);
                    toast.error(err?.response?.data?.message ?? "Failed to load order");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (params.id) fetchOrder();
        return () => {
            mounted = false;
            abortCtrl.abort();
        };
    }, [params.id]);

    const copyToClipboard = async (text?: string) => {
        if (!text) return toast.error("Nothing to copy");
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied");
        } catch {
            toast.error("Copy failed");
        }
    };

    const handleChangeStatus = async (newStatus: OrderStatus) => {
        if (!order) return;
        if (mutating) return;
        setMutating(true);

        const prev = order;
        setOrder({ ...order, status: newStatus });

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            if (!token) throw new Error("Token not found");

            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/v1/page/shop/order/${encodeURIComponent(params.id)}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
            );

            const updated: IOrder = res.data?.data ?? { ...order, status: newStatus };
            setOrder(updated);
            // onUpdated?.(updated);
            toast.success("Status updated");
        } catch (err: any) {
            console.error("status update failed", err);
            setOrder(prev);
            toast.error(err?.response?.data?.message ?? "Failed to update status");
        } finally {
            setMutating(false);
        }
    };

    return (
        <div className="p-6">
            <div className="card-bg p-5 rounded-lg shadow border border-gray-700">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-300 mb-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <h1 className="text-2xl font-semibold text-white">Order Details</h1>
                        <p className="text-sm text-gray-400 mt-1">Order #{order?._id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => copyToClipboard(order?._id)} className="px-2 py-1 bg-white/5 rounded inline-flex items-center gap-2">
                            <Clipboard className="w-4 h-4" /> Copy ID
                        </button>

                        <button onClick={() => copyToClipboard(order?.shopId)} className="px-2 py-1 bg-white/5 rounded inline-flex items-center gap-2">
                            <Clipboard className="w-4 h-4" /> Copy Shop
                        </button>

                        <button onClick={() => router.push(`/admin-dashboard/update-order/${order?._id}`)} className="px-2 py-1 bg-white/5 rounded inline-flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Edit
                        </button>

                        {/* <button onClick={handleDelete} className="px-2 py-1 bg-red-600 rounded inline-flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button> */}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Customer */}
                    <div className="col-span-1 bg-surface p-4 rounded border border-gray-700">
                        <h3 className="text-sm text-gray-300 mb-2">Customer</h3>
                        <div className="text-white font-medium">{order?.customerName ?? "N/A"}</div>
                        <div className="mt-2 text-sm text-gray-400">Contact</div>
                        <div className="text-sm text-gray-300">{order?.contact ?? "N/A"}</div>
                        <div className="mt-2 text-sm text-gray-400">Address</div>
                        <div className="text-sm text-gray-300 break-words">{order?.address ?? "N/A"}</div>
                    </div>

                    {/* Middle: Product */}
                    <div className="col-span-1 md:col-span-1 bg-surface p-4 rounded border border-gray-700">
                        <h3 className="text-sm text-gray-300 mb-2">Product</h3>
                        <div className="text-white font-medium">{order?.productName ?? "N/A"}</div>
                        <div className="mt-2 text-sm text-gray-400">Quantity</div>
                        <div className="text-sm text-gray-300">{order?.quantity ?? "1"}</div>
                        <div className="mt-2 text-sm text-gray-400">Payment</div>
                        <div className="text-sm text-gray-300">{order?.paymentMethod ?? "N/A"}</div>
                        <div className="mt-3 text-xs text-gray-400">Created</div>
                        {/* <div className="text-sm text-gray-300">{formattedDate}</div> */}
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="col-span-1 bg-surface p-4 rounded border border-gray-700">
                        <h3 className="text-sm text-gray-300 mb-2">Status</h3>

                        <select
                            value={order?.status}
                            onChange={(e) => handleChangeStatus(e.target.value as OrderStatus)}
                            disabled={mutating}
                            className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded text-white"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => handleChangeStatus("confirmed")}
                                disabled={mutating || order?.status === "confirmed"}
                                className="px-3 py-2 bg-green-600 rounded disabled:opacity-50"
                            >
                                Confirm
                            </button>

                            <button
                                onClick={() => handleChangeStatus("delivered")}
                                disabled={mutating || order?.status === "delivered"}
                                className="px-3 py-2 bg-indigo-600 rounded disabled:opacity-50"
                            >
                                Mark Delivered
                            </button>

                            <button
                                onClick={() => handleChangeStatus("cancelled")}
                                disabled={mutating || order?.status === "cancelled"}
                                className="px-3 py-2 bg-red-600 rounded disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notes / History */}
                <div className="mt-6 bg-surface p-4 rounded border border-gray-700">
                    <h3 className="text-sm text-gray-300 mb-2">Order Activity</h3>
                    <div className="text-sm text-gray-400">No activity log available. (Consider adding statusHistory in backend)</div>
                </div>
            </div>
        </div>
    )
}
