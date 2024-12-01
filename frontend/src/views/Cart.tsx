"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH4, TypographyP, TypographySmall } from "@/components/ui/typography";

interface CartItem {
  product_id: number;  
  product_name: string; 
  price: number;
  quantity: number;
}

const CartView = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<string>("pickup");  
  const [paymentOption, setPaymentOption] = useState<string>("cash");
  const [deliveryCost, setDeliveryCost] = useState<number>(0); 
  const router = useRouter();

  useEffect(() => {
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
        setCartTotal(total);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCart();
  }, []);
  
  useEffect(() => {
    setDeliveryCost(deliveryOption === "delivery" ? 1000 : 0);
  }, [deliveryOption]);


  const handleRemoveItem = async (productId: number) => {
    try {
      const token = JSON.parse(localStorage.getItem("token") || "{}");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/cart/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
        setCartTotal((prev) =>
          prev - cartItems.find((item) => item.product_id === productId)!.price
        );
      } else {
        setError("Failed to remove the item.");
      }
    } catch (error) {
      setError("An error occurred while removing the item.");
    }
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      const token = JSON.parse(localStorage.getItem("token") || "{}");
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/cart/${productId}?quantity=${quantity}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",  
          },
        }
      );
  
      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          )
        );
  
        const updatedItem = cartItems.find((item) => item.product_id === productId);
        setCartTotal((prev) =>
          prev +
          ((quantity - updatedItem!.quantity) * updatedItem!.price)
        );
      } else {
        setError("Failed to update item quantity.");
      }
    } catch (error) {
      setError("An error occurred while updating the quantity.");
    }
  };
  
  const handleClearCart = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token") || "{}");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/cart/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setCartItems([]);
        setCartTotal(0);
      } else {
        setError("Failed to clear the cart.");
      }
    } catch (error) {
      setError("An error occurred while clearing the cart.");
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-center">Your Cart</h1>
      {loading ? (
        <Skeleton className="w-full max-w-md h-64 rounded-md" />
      ) : error ? (
        <TypographyP className="text-red-500">{error}</TypographyP>
      ) : cartItems.length > 0 ? (
        cartItems.map((item) => (
          <div
            key={item.product_id}
            className="w-full max-w-3xl p-4 border border-gray-200 shadow-sm rounded-lg flex justify-between items-start"
          >
            <div className="flex flex-col">
              <TypographySmall className="text-gray-500">
                {item.product_name}
              </TypographySmall>
              <TypographyP>
                {item.quantity} × {item.price} ₸
              </TypographyP>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleUpdateQuantity(item.product_id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
                <TypographyP>{item.quantity}</TypographyP>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleUpdateQuantity(item.product_id, item.quantity + 1)
                  }
                >
                  +
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveItem(item.product_id)}
            >
              Remove
            </Button>
          </div>
        ))
      ) : (
        <TypographyP>Your cart is empty.</TypographyP>
      )}

      {cartItems.length > 0 && (
        <div className="w-full max-w-3xl mt-4 flex justify-between items-center">
          <TypographyH4>Total: {cartTotal} ₸</TypographyH4>

          <div>
            <TypographyP>Delivery Option:</TypographyP>
            <div className="flex gap-2">
              <label>
                <input
                  type="radio"
                  name="deliveryOption"
                  value="pickup"
                  checked={deliveryOption === "pickup"}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                />
                Pickup (0 ₸)
              </label>
              <label>
                <input
                  type="radio"
                  name="deliveryOption"
                  value="delivery"
                  checked={deliveryOption === "delivery"}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                />
                Delivery (1000 ₸)
              </label>
            </div>
          </div>

          <div>
            <TypographyP>Payment Option:</TypographyP>
            <div className="flex gap-2">
              <label>
                <input
                  type="radio"
                  name="paymentOption"
                  value="cash"
                  checked={paymentOption === "cash"}
                  onChange={(e) => setPaymentOption(e.target.value)}
                />
                Cash
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentOption"
                  value="card"
                  checked={paymentOption === "card"}
                  onChange={(e) => setPaymentOption(e.target.value)}
                />
                Card
              </label>
            </div>
          </div>

          <div>
            <TypographyH4>Delivery Cost: {deliveryCost} ₸</TypographyH4>
            <TypographyH4>
              Total Amount: {cartTotal + deliveryCost} ₸
            </TypographyH4>
          </div>

          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleClearCart}>
              Clear Cart
            </Button>
            <Button onClick={handleCheckout} variant="default">
              Checkout
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CartView;
