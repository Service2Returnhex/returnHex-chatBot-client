"use client"
import OrdersTable from "@/components/userDashboard/OrderTable";
import { JwtPayload } from "@/types/jwtPayload.type";
import { IOrder } from "@/types/order.type";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// export const mockOrders: IOrder[] = [
//     {
//         _id: "1",
//         userId: "sender123",
//         shopId: "714401141759522",
//         orderId: "ORD-0001",
//         customerName: "John Doe",
//         productName: "JBL Headphone",
//         quantity: 1,
//         address: "123 Main St, Dhaka",
//         contact: "+8801612345678",
//         paymentMethod: "Cash on Delivery",
//         status: "pending",
//         createdAt: new Date().toISOString(),
//     },
//     {
//         _id: "2",
//         userId: "sender456",
//         shopId: "714401141759522",
//         orderId: "ORD-0002",
//         customerName: "Jane Smith",
//         productName: "Bluetooth Speaker",
//         quantity: 2,
//         address: "45 Lakeview Rd, Sylhet",
//         contact: "+8801712345678",
//         paymentMethod: "Bkash",
//         status: "processing",
//         createdAt: new Date().toISOString(),
//     },
// ];


export default function Orders() {

    const [orders, setOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        async function loadByOwner() {
            setLoading(true);
            try {
                const token = typeof window !== "undefined"
                    ? localStorage.getItem("authToken") : null;
                if (!token) {
                    toast.error("Please login first");
                    return;
                }

                const decoded = jwtDecode<JwtPayload & { userId?: string }>(token);
                const ownerId = decoded?.userId ?? decoded?._id ?? decoded?.id;
                if (!ownerId) {
                    toast.error("Could not get owner id from token");
                    return;
                }

                // 1) get shops for this owner
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/owner/${encodeURIComponent(ownerId)}`,
                    {
                        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "69420" },
                        signal: controller.signal,
                    }
                );

                // debug
                console.log("owner -> shops response:", res.status, res.data);

                if (!res.data?.success) {
                    toast.error(res.data?.message || "Failed to load pages");
                    return;
                }

                const shops = Array.isArray(res.data.data) ? res.data.data : [];
                if (shops.length === 0) {
                    // no shops -> clear orders
                    if (mounted) setOrders([]);
                    return;
                }

                // 2) fetch orders for each shop in parallel (allSettled so one fail doesn't abort all)
                const fetchPromises = shops.map((shop: any) =>
                    axios.get(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/order/${encodeURIComponent(shop.shopId)}`,
                        {
                            headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "69420" },
                            signal: controller.signal,
                        }
                    )
                );

                const settled = await Promise.allSettled(fetchPromises);

                // 3) normalize per-shop orders
                const perShopOrders = settled.map((s, idx) => {
                    const shop = shops[idx];
                    if (s.status === "rejected") {
                        console.warn(`Orders fetch failed for shop ${shop?.shopId}:`, s.reason);
                        return [];
                    }

                    const res1 = (s as PromiseFulfilledResult<any>).value;
                    console.log(`orders response for ${shop.shopId}:`, res1?.status, res1?.data);

                    // Normalize: server might return orders at res1.data.data.orders or res1.data.data
                    let ordersFromRes: any[] = [];
                    if (Array.isArray(res1?.data?.data?.orders)) ordersFromRes = res1.data.data.orders;
                    else if (Array.isArray(res1?.data?.data)) ordersFromRes = res1.data.data;
                    else ordersFromRes = [];

                    // attach shop metadata
                    return ordersFromRes.map((ord: any) => ({
                        ...ord,
                        _shopId: shop.shopId,
                        _pageName: shop.pageName ?? shop.pageName,
                    }));
                });

                // 4) flatten and set state
                const mergedOrders = perShopOrders.flat();
                console.log("mergedOrders:", mergedOrders);

                if (mounted) setOrders(mergedOrders);
            } catch (err: any) {
                if (axios.isCancel(err)) {
                    console.log("Request cancelled");
                } else {
                    console.error("Failed to fetch orders:", err);
                    toast.error(err?.response?.data?.message || err?.message || "Could not load orders");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadByOwner();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    console.log("order", orders);
    return (
        <div>
            <OrdersTable
                orders={orders}
                setOrders={setOrders}
                loading={false}
                onView={(o) => console.log("view", o)}
                onEdit={(o) => console.log("edit", o)}
                onToggleStatus={(id) => console.log("toggle", id)}
            />
        </div>
    );
}
