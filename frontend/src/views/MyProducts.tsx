'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Product } from "@/lib/types/product";
import { FarmerProfile } from "@/lib/types/profile";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TypographyH4,
  TypographyP,
  TypographySmall,
} from "@/components/ui/typography";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Info } from "lucide-react";

const ImageCarousel = ({ images }: { images: {
    image_url: string;
    id: number
}[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
  
    const handleScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, clientWidth } = carouselRef.current;
        const newIndex = Math.round(scrollLeft / clientWidth);
        setActiveIndex(newIndex);
      }
    };
  
    return (
      <div className="relative w-[126px] h-[126px] border rounded-md overflow-hidden">
        {images.length > 0 && (
          <div
            ref={carouselRef}
            className="flex h-full overflow-x-scroll snap-x snap-mandatory hide-scrollbar"
            onScroll={handleScroll}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full h-full relative snap-start"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND}${image.image_url}` || "/images/farm.webp"}
                  alt={`Product Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === activeIndex ? "bg-[white]" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };
  
  

export const MyProducts = () => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = JSON.parse(localStorage.getItem("token") || "{}");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/profiles/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      const fetchProducts = async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/products/farmer/${profile.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      };
      fetchProducts();
    }
  }, [profile]);

  const handleEdit = (productId: number) => {
    router.push(`/products/edit/${productId}`);
  };

  const handleDelete = async (productId: number) => {
    const token = JSON.parse(localStorage.getItem("token") || "{}");
    if (token) {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND}/products/${productId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
                Authorization: `Bearer ${token.access_token}`,
              },
            }
          );
          if (response.ok) {
            setProducts(products.filter((product) => product.id !== productId));
          }
    }
    
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      {products.length > 0 ? (
        products.map((product: Product) => (
          <Card key={product.id} className="w-full max-w-3xl p-0 border border-gray-200 shadow-sm rounded-lg">
            <CardContent className="flex flex-row gap-4 p-4 items-start">
              <div className="w-1/3">
                <ImageCarousel
                  images={
                    product.images
                  }
                />
              </div>
              <div className="w-2/3 flex flex-col justify-between gap-2">
                <div>
                  <TypographySmall className="text-gray-500">
                    {product.category}
                  </TypographySmall>
                  <TypographyH4 className="font-semibold">
                    {product.name}
                  </TypographyH4>
                  <TypographyP className="text-gray-700">
                    {product.description}
                  </TypographyP>
                  <TypographyP className="text-gray-700">
                    {
                      product.quantity > 0 ? 
                      product.quantity < 5 ?
                      <span className="w-full flex items-center gap-2">
                        <span className="text-red-500">Only {product.quantity} left</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger><Info size={16} stroke="red" /></DropdownMenuTrigger>
                          <DropdownMenuContent>
                          <TypographyP className="text-gray-700">
                              {product.quantity} items left in stock. Please restock soon.
                            </TypographyP>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </span> :
                      <span className="">In Stock: {product.quantity}</span>
                       : "Out of Stock"
                    }
                  </TypographyP>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <TypographyH4 className="text-green-600">
                    {product.price} ₸
                  </TypographyH4>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => handleEdit(product.id)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(product.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Skeleton className="w-full max-w-md h-64 rounded-md" />
      )}
    </section>
  );
};
