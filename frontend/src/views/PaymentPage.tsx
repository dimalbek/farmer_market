"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TypographyH4, TypographyP } from "@/components/ui/typography";

interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

const PaymentView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [deliveryOption, setDeliveryOption] = useState<string | null>(null);
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token") || "{}");

      if (!token?.access_token) {
        throw new Error("Token is missing or invalid.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND?.replace(/\/$/, "")}/cart/`,
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
        throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
      }

      const items: CartItem[] = await response.json();

      if (!Array.isArray(items)) {
        throw new Error("Unexpected response format. Expected an array.");
      }

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setCartItems(items);
      setCartTotal(total); // Set the calculated cart total
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setError(error.message);
      } else {
        console.error("An unknown error occurred.");
        setError("An unknown error occurred.");
      }
    }
  };

  useEffect(() => {
    fetchCart(); // Fetch cart and calculate total
    const savedDeliveryOption = localStorage.getItem("deliveryOption") || "pickup";
    setDeliveryOption(savedDeliveryOption);
    setDeliveryCost(savedDeliveryOption === "delivery" ? 1000 : 0);
  }, []);

  useEffect(() => {
    setTotalPayment(cartTotal + deliveryCost); // Recalculate total payment
  }, [cartTotal, deliveryCost]);


  // Handle payment success or cancelation based on URL query
  useEffect(() => {
    const handlePaymentStatus = () => {
      const query = new URLSearchParams(window.location.search);
      const sessionId = query.get("session_id");

      if (query.get("success") && sessionId) {
        // Redirect to the success page with session ID
        router.push(`/success?session_id=${sessionId}`);
        window.history.replaceState({}, document.title, window.location.pathname); // Clear query params
      } else if (query.get("cancel")) {
        // Show an error message if payment was canceled
        setError("Your payment was canceled. Please try again.");
        window.history.replaceState({}, document.title, window.location.pathname); // Clear query params
      }
    };

    handlePaymentStatus();
  }, [router]);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = JSON.parse(localStorage.getItem("token") || "{}");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/checkout/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.access_token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Failed to create Stripe Checkout session.");
      }
    } catch (error) {
      setError("An error occurred while initiating the payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-center">Payment</h1>
      <hr className="border-gray-300 w-full max-w-3xl" />

      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
        <TypographyP className="text-gray-700">Order Total:</TypographyP>
          <TypographyP className="text-gray-900 font-medium">
            {cartTotal} ₸
          </TypographyP>
        </div>
        <hr className="border-gray-300" />

        <div className="flex justify-between items-center">
          <TypographyP className="text-gray-700">Delivery Cost:</TypographyP>
          <TypographyP className="text-gray-900 font-medium">{deliveryCost} ₸</TypographyP>
        </div>
        <hr className="border-gray-300" />

        <div className="flex justify-between items-center">
          <TypographyP className="text-gray-700 font-semibold">Total Payment:</TypographyP>
          <TypographyH4 className="text-gray-900 font-bold">
            {totalPayment} ₸
          </TypographyH4>
        </div>
        <hr className="border-gray-300" />

        {error && <TypographyP className="text-red-500 text-center">{error}</TypographyP>}

        <div className="flex justify-end gap-2">
          <Button
            onClick={initiatePayment}
            variant="default"
            disabled={loading || cartTotal === null}
            className={`px-6 py-2 ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PaymentView;
