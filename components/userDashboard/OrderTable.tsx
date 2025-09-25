// components/adminDashboard/OrdersTable.tsx
// "use client";

import { IOrder, OrderStatus } from "@/types/order.type";
import { Clipboard, Edit3, Eye } from "lucide-react"; // replace with your icon set
import { toast } from "react-toastify";


/* ---------------- Helpers ---------------- */
const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    } catch (err) {
        console.error("copy failed", err);
        toast.error("Copy failed");
    }
};

const statusClasses = (status: OrderStatus) => {
    switch (status) {
        case "pending":
            return "bg-yellow-600 text-black";
        case "processing":
            return "bg-blue-600 text-white";
        case "shipped":
            return "bg-indigo-600 text-white";
        case "delivered":
            return "bg-green-600 text-white";
        case "cancelled":
            return "bg-red-600 text-white";
        default:
            return "bg-gray-600 text-white";
    }
};

/* ---------------- OrdersTable Component ---------------- */
type Props = {
    orders: IOrder[];
    loading?: boolean;
    onView?: (order: IOrder) => void;
    onEdit?: (order: IOrder) => void;
    onToggleStatus?: (orderId: string) => void; // e.g. cycle statuses
};

export default function OrdersTable({ orders, loading }: Props) {
    return (
        <div className="p-2">
            <div className="card-bg p-5 rounded-lg shadow border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Order Details</h2>

                {/* Desktop / tablet: table (md+) */}
                <div className="hidden md:block">
                    <div className="overflow-x-auto -mx-5 px-5">
                        <table className="w-full table-fixed text-left border-collapse min-w-full">
                            <thead>
                                <tr className="border-b border-gray-700 ">
                                    <th className="p-3 text-sm font-medium text-gray-300 w-[14%]">Customer</th>
                                    <th className="p-3 text-sm font-medium text-gray-300 w-[30%]">Order ID / Shop ID</th>
                                    <th className="p-3 text-sm font-medium text-gray-300 w-[20%]">Product / Qty / Payment</th>
                                    <th className="p-3 text-sm font-medium text-gray-300 w-[16%]">Contact / Address / Created</th>
                                    <th className="p-3 text-sm font-medium text-gray-300 w-[12%]">Status</th>
                                    <th className="p-3 text-sm font-medium text-gray-300 w-[8%]">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((o, idx) => (
                                    <tr key={o._id || idx} className="border-b border-gray-800 hover:bg-white/2 transition-colors align-top">
                                        {/* Customer */}
                                        <td className="p-3 align-top">
                                            <div className="font-semibold text-white truncate max-w-[220px]" title={o.customerName}>
                                                {o.customerName || "N/A"}
                                            </div>
                                        </td>

                                        {/* Order ID */}
                                        <td className="p-3 align-top text-sm text-gray-300">
                                            <div className=" max-w-[350px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col ">
                                                        <div className="text-xs text-gray-400">Shop Id</div>
                                                        <div className="truncate max-w-[200px]">{o._id}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(o._id ?? "")}
                                                        className="p-1 pt-4 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                                                        aria-label="Copy order id"
                                                    >
                                                        <Clipboard className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col ">
                                                        <div className="text-xs text-gray-400">Shop Id</div>
                                                        <div className="truncate max-w-[200px]">{o.shopId}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(o.shopId)}
                                                        className="p-1 pt-4 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                                                        aria-label="Copy shop id"
                                                    >
                                                        <Clipboard className="h-4 w-4" />
                                                    </button>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Product */}
                                        <td className="p-3 align-top text-sm text-gray-300">

                                            <div className="truncate max-w-[220px]">
                                                <div className="text-xs text-gray-400">Product Name</div>
                                                <div className="line-clamp-3 break-words whitespace-normal">{o.productName}</div>
                                                <div className="text-xs text-gray-400 mt-1">Quantity</div>
                                                <div className="truncate">{o.quantity}</div>
                                                <div className="text-xs text-gray-400 mt-1">Payment</div>
                                                <div className="truncate">{o.paymentMethod}</div>
                                            </div>
                                        </td>

                                        {/* Contact / Address */}
                                        <td className="p-3 align-top text-sm text-gray-300">
                                            <div className="truncate max-w-[220px]">
                                                <div className="text-xs text-gray-400">Contact</div>
                                                <div className="truncate">{o.contact}</div>
                                                <div className="text-xs text-gray-400 mt-1">Address</div>
                                                <div className="truncate">{o.address}</div>
                                                <div className="text-xs text-gray-400 mt-1">Created</div>
                                                <div className="truncate">{new Date(o.createdAt ?? "").toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}</div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-3 align-top">
                                            <button
                                                // onClick={() => onToggleStatus?.(o.orderId)}
                                                className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full ${statusClasses(o.status)}`}
                                                aria-label={`Order status: ${o.status}`}
                                                title="Click to toggle status"
                                            >
                                                {o.status}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3 align-top relative cursor-pointer text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    aria-label="View order"
                                                    // onClick={() => onView?.(o)}
                                                    className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                <button
                                                    aria-label="Edit order"
                                                    // onClick={() => onEdit?.(o)}
                                                    className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {orders.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={10} className="p-4 text-center text-gray-400">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile: stacked cards (md and down) */}
                <div className="md:hidden space-y-3">
                    {orders.map((o) => (
                        <article key={o._id} className="bg-surface p-4 rounded-lg border border-gray-700 w-full break-words">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-semibold text-white truncate" title={o.customerName}>{o.customerName}</h3>
                                        <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full ${statusClasses(o.status)}`}>
                                            <span className="w-2 h-2 rounded-full mr-2" aria-hidden />
                                            {o.status}
                                        </span>
                                    </div>

                                    <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-300">
                                        <div>
                                            <dt className="text-xs text-gray-400">Order ID</dt>
                                            <dd className="truncate break-words">{o._id}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-400">Shop ID</dt>
                                            <dd className="truncate break-words">{o.shopId}</dd>
                                        </div>

                                        <div>
                                            <dt className="text-xs text-gray-400">Product</dt>
                                            <dd className="truncate">{o.productName} • Qty: {o.quantity}</dd>
                                        </div>

                                        <div>
                                            <dt className="text-xs text-gray-400">Contact</dt>
                                            <dd className="truncate">{o.contact}</dd>
                                        </div>

                                        <div>
                                            <dt className="text-xs text-gray-400">Address</dt>
                                            <dd className="truncate">{o.address}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-400">Payment Method</dt>
                                            <dd className="truncate">{o.paymentMethod}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-gray-400">createdAt</dt>
                                            <dd className="truncate">{new Date(o.createdAt ?? "").toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}</dd>
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => copyToClipboard(o.orderId)} className="text-xs text-gray-300 hover:text-white/90 border border-gray-500 py-1 px-2 rounded-xl">Copy ID</button>
                                            <button className="text-xs text-gray-300 hover:text-white/90 border border-gray-500 py-1 px-2 rounded-xl">View</button>
                                            <button className="text-xs text-gray-300 hover:text-white/90 border border-gray-500 py-1 px-2 rounded-xl">Edit</button>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </article>
                    ))}

                    {orders.length === 0 && !loading && (
                        <div className="text-center text-gray-400">No orders found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

