"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH4, TypographyP, TypographySmall } from "@/components/ui/typography";

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  buyer_id: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token") || "{}");

        if (!token?.access_token) {
          throw new Error("Token is missing or invalid.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND?.replace(/\/$/, "")}/orders/`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }

        const fetchedOrders: Order[] = await response.json();

        if (!Array.isArray(fetchedOrders)) {
          throw new Error("Unexpected response format. Expected an array.");
        }

        setOrders(fetchedOrders);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderDetails = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-center">Your Orders</h1>
      {loading ? (
        <Skeleton className="w-full max-w-md h-64 rounded-md" />
      ) : error ? (
        <TypographyP className="text-red-500">{error}</TypographyP>
      ) : orders.length > 0 ? (
        orders.map((order) => (
          <div
            key={order.id}
            className="w-full max-w-3xl p-4 border border-gray-200 shadow-sm rounded-lg flex justify-between items-start"
          >
            <div className="flex flex-col">
              <TypographySmall className="text-gray-500">
                Order ID: {order.id}
              </TypographySmall>
              <TypographyP>
                Total Price: {order.total_price} ₸
              </TypographyP>
              <TypographyP>Status: {order.status}</TypographyP>
              <TypographySmall>
                Created At: {new Date(order.created_at).toLocaleString()}
              </TypographySmall>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleOrderDetails(order.id)}
            >
              View Details
            </Button>
          </div>
        ))
      ) : (
        <TypographyP>No orders available.</TypographyP>
      )}
    </section>
  );
};

export default OrdersPage;
