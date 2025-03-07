"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH4, TypographyP, TypographySmall } from "@/components/ui/typography";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  buyer_id: number;
  items: OrderItem[];
}

const OrderPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<{ [productId: number]: string }>({});
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const orderId = params?.orderId;

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

  const handleCommentChange = (productId: number, value: string) => {
    setComment((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleCommentSubmit = async (productId: number) => {
    try {
      const token = JSON.parse(localStorage.getItem("token") || "{}");

      if (!token?.access_token) {
        throw new Error("Token is missing or invalid.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/comments/products/${productId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.access_token}`,
          },
          body: JSON.stringify({ content: comment[productId] }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Comment added successfully!",
          variant: "default",
        });
        setComment((prev) => ({
          ...prev,
          [productId]: "", // Clear the comment input after submission
        }));
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData?.message || "Failed to add comment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

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

          <div className="mt-4">
            <TypographyH4 className="mb-2">Order Items</TypographyH4>
            {order.items.map((item, index) => (
              <div key={index} className="mb-4 p-2 border border-gray-100 rounded-md">
                <TypographyP>
                  <strong>Product:</strong> {item.product.name}
                </TypographyP>
                <TypographyP>
                  <strong>Description:</strong> {item.product.description}
                </TypographyP>
                <TypographyP>
                  <strong>Category:</strong> {item.product.category}
                </TypographyP>
                <TypographyP>
                  <strong>Price:</strong> {item.product.price} ₸
                </TypographyP>
                <TypographyP>
                  <strong>Quantity:</strong> {item.quantity}
                </TypographyP>

                <div className="mt-2">
                  <Input
                    placeholder="Write your comment..."
                    value={comment[item.product.id] || ""}
                    onChange={(e) => handleCommentChange(item.product.id, e.target.value)}
                    className="w-full mb-2"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCommentSubmit(item.product.id)}
                    disabled={!comment[item.product.id]?.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
