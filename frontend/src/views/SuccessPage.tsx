"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TypographyH4, TypographyP } from "@/components/ui/typography";

const SuccessView = () => {
  const router = useRouter();

  const handleReturnToHome = () => {
    router.push("/");  
  };

  const handleViewOrders = () => {
    router.push("/orderspage");  
  };

  return (
    <section className="w-full flex flex-col items-center gap-6 mt-12">
      <TypographyH4 className="text-2xl font-bold text-green-600 text-center">
        Payment Successful!
      </TypographyH4>
      <TypographyP className="text-gray-700 text-center">
        Thank you for your purchase. Your payment has been processed successfully.
      </TypographyP>
      <div className="flex flex-col gap-4 items-center">
        
        <TypographyP className="text-gray-700 font-medium text-center">
          Have questions? Contact our support team at{" "}
          <span className="text-blue-600">support@farmus.com</span>.
        </TypographyP>
      </div>
      <div className="flex gap-4">
        <Button onClick={handleReturnToHome} variant="default">
          Return to Home
        </Button>
        <Button onClick={handleViewOrders} variant="outline">
          View My Orders
        </Button>
      </div>
    </section>
  );
};

export default SuccessView;
