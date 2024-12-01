"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const OrderPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          throw new Error("Order ID is missing.");
        }

        const token = JSON.parse(localStorage.getItem("token") || "{}");

        if (!token?.access_token) {
          throw new Error("Token is missing or invalid.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND?.replace(/\/$/, "")}/orders/${orderId}`,
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
          throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
        }

        const fetchedOrder: Order = await response.json();
        setOrder(fetchedOrder);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <section className="w-full flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-center">Order Details</h1>
      {loading ? (
        <Skeleton className="w-full max-w-md h-64 rounded-md" />
      ) : error ? (
        <TypographyP className="text-red-500">{error}</TypographyP>
      ) : order ? (
        <div className="w-full max-w-3xl p-4 border border-gray-200 shadow-sm rounded-lg">
          <TypographyH4 className="mb-4">Order #{order.id}</TypographyH4>
          <TypographyP>
            <strong>Total Price:</strong> {order.total_price} ₸
          </TypographyP>
          <TypographyP>
            <strong>Status:</strong> {order.status}
          </TypographyP>
          <TypographySmall>
            <strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}
          </TypographySmall>
          <TypographyP>
            <strong>Buyer ID:</strong> {order.buyer_id}
          </TypographyP>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      ) : (
        <TypographyP>No order details available.</TypographyP>
      )}
    </section>
  );
};

export default OrderPage;
