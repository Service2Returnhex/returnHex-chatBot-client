export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface IOrder {
    _id?: string;
    userId: string;
    shopId: string;
    orderId: string;
    customerName: string;
    productName: string;
    quantity: number | string;
    address: string;
    contact: string;
    paymentMethod: string;
    status: OrderStatus;
    createdAt?: string | Date;
}