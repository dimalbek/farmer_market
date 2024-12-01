'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TypographyH4, TypographyP, TypographySmall } from '@/components/ui/typography';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
}

interface Purchase {
  product: Product;
  quantity: number;
  purchase_time: string;
}

const FarmerOrdersPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('token') || '{}');

        if (!token?.access_token) {
          throw new Error('Token is missing or invalid.');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND?.replace(/\/$/, '')}/orders/farmer/orders`,
          {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
              Authorization: `Bearer ${token.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch purchases: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setPurchases(data.purchases || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  return (
    <section className="w-full flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-center">Farmer Orders</h1>
      {loading ? (
        <Skeleton className="w-full max-w-md h-64 rounded-md" />
      ) : error ? (
        <TypographyP className="text-red-500">{error}</TypographyP>
      ) : purchases.length > 0 ? (
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {purchases.map((purchase, index) => (
            <div
              key={index}
              className="w-full p-4 border border-gray-200 shadow-sm rounded-lg"
            >
              <TypographyH4 className="mb-2">Product Details</TypographyH4>
              <TypographyP>
                <strong>Name:</strong> {purchase.product.name}
              </TypographyP>
              <TypographyP>
                <strong>Description:</strong> {purchase.product.description}
              </TypographyP>
              <TypographyP>
                <strong>Category:</strong> {purchase.product.category}
              </TypographyP>
              <TypographyP>
                <strong>Price:</strong> {purchase.product.price} ₸
              </TypographyP>
              <TypographyP>
                <strong>Quantity:</strong> {purchase.quantity}
              </TypographyP>
              <TypographySmall>
                <strong>Purchase Time:</strong>{' '}
                {new Date(purchase.purchase_time).toLocaleString()}
              </TypographySmall>
            </div>
          ))}
        </div>
      ) : (
        <TypographyP>No purchases available.</TypographyP>
      )}
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => router.back()}
      >
        Go Back
      </Button>
    </section>
  );
};

export default FarmerOrdersPage;
