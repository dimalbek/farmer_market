
'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH1, TypographyH3, TypographyP, TypographySmall } from "@/components/ui/typography";
import { Product } from "@/lib/types/product";
import { FarmerProfile } from "@/lib/types/profile";
import { ImageCarousel } from "@/widgets/ImageCarousel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import React from "react";


interface Farmer  {
    id: string;
    fullname: string;
    email: string;
    phone: string;
    role: "Admin" | "Buyer" | "Farmer";
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    author_id: number;
  }
  
export const ProductPage = () => {
    const [product, setProduct] = useState<Product | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
    const [farmer, setFarmer] = useState<Farmer | null>(null);
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProduct = async () => {
        try {
            const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND}/products/${params.productId}`,
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
            setProduct(data);
            } else {
            setError("Product not found");
            }
        } catch (error) {
            setError("An error occurred");
            console.log(error)
        } finally {
            setLoading(false);
        }
        };
        if (params.productId) fetchProduct();
    }, [params]);

    useEffect(() => {

        const fetchFarmerProfile = async () => {
            try {
                const token = JSON.parse(localStorage.getItem("token") || "{}");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND}/profiles/farmer/${product?.farmer_id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "true",
                            "Authorization": `Bearer ${token.access_token}`
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setFarmerProfile(data);
                }
            } catch (error) {
                setError("An error occurred");
                console.log(error)
            } finally {
                setLoading(false);
            }
        }

        if (product) {
            fetchFarmerProfile();
        }
    }, [product])

    useEffect(() => {

        const fetchFarmer = async () => {
            try {
                const token = JSON.parse(localStorage.getItem("token") || "{}");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND}/auth/users/${farmerProfile?.user_id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "true",
                            "Authorization": `Bearer ${token.access_token}`
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setFarmer(data);
                }
            } catch (error) {
                setError("An error occurred");
                console.log(error)
            } finally {
                setLoading(false);
            }
        }

        if (farmerProfile) {
            fetchFarmer();
        }
    }, [farmerProfile])

    useEffect(() => {
        const fetchComments = async () => {
          try {
            console.log("Fetching comments for product:", params.productId);
      
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/comments/products/${params.productId}/comments`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              },
            });
      
            console.log("Comments API response status:", response.status);
      
            if (response.ok) {
              const data = await response.json();
              console.log("Comments API response data:", data);
              setComments(data.comments || []);
            } else {
              console.error("Failed to fetch comments. Response:", response);
              toast({
                title: 'Error',
                description: 'Failed to fetch comments.',
                variant: 'destructive',
              });
            }
          } catch (error) {
            console.error("Error fetching comments:", error);
            toast({
              title: 'Error',
              description: 'An unexpected error occurred.',
              variant: 'destructive',
            });
          }
        };
      
        if (params.productId) fetchComments();
      }, [params.productId, toast]);
      

    const handleCreateChat = async () => {
        try {
            const token = JSON.parse(localStorage.getItem("token") || "{}");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND}/chat/chats/${farmerProfile?.user_id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                        "Authorization": `Bearer ${token.access_token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                router.push(`/chats/${data.id}`);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    }

     
const handleAddToCart = async () => {
    

    try {
        const token = JSON.parse(localStorage.getItem("token") || "{}");

        const url = `${process.env.NEXT_PUBLIC_BACKEND}/cart/`;

        const requestBody = {
            product_id: product?.id || 0,
            quantity: 1,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.access_token}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            toast({
          title: "Success",
          description: "Product added to cart successfully!",
          variant: "default",
        });
      } else if (response.status === 422) {
        const errorData = await response.json();
        toast({
          title: "Validation Error",
          description: errorData?.message || "Invalid data. Please check the product details.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to add to cart: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding to cart.",
        variant: "destructive",
      });
    }
};

    
    
    if (loading) {
        return <Skeleton />;
    }
    
    if (error) {
        return <TypographyP>{error}</TypographyP>;
    }
    
    return (
        <div className="flex flex-col items-center gap-2 overflow-scroll !pb-[100px] px-4">
            <ImageCarousel images={product?.images || []} width={256} height={256} />
            <div className="w-full flex flex-col items-start gap-2">
                <TypographyH1>{product?.name}</TypographyH1>
                <TypographyP>{product?.description}</TypographyP>
            </div>
            <div className="w-full flex flex-row items-center justify-between gap-2">
                <div className="w-max gap-2 flex items-center">
                    <Badge>{product?.category}</Badge>
                    <TypographyP>{product?.price} ₸</TypographyP>
                </div>
                
                <TypographyP>Quantity: {product?.quantity}</TypographyP>
            </div>
            <div className="w-full flex flex-col items-start gap-1 mt-4 pt-4 border-t">
                <TypographyH3>Farmer</TypographyH3>
                <TypographyP>Name: {farmer?.fullname}</TypographyP>
                <TypographyP>Email: {farmer?.email}</TypographyP>
                <TypographyP>Phone: {farmer?.phone}</TypographyP>
            </div>

            <div className="w-full flex flex-col items-start gap-1 mt-4 pt-4 border-t">
                <TypographyH3>Farm: {farmerProfile?.farm_name}</TypographyH3>
                <TypographyP>Location: {farmerProfile?.location}</TypographyP>
            </div>
            <div className="w-full flex flex-col items-start gap-1 mt-4 pt-4 border-t">
            <TypographyH3>Comments</TypographyH3>
            {comments.length > 0 ? (
             comments.map((comment) => (
            <div key={comment.id} className="p-2 border border-gray-200 rounded-md mb-2">
              <TypographyP>{comment.content}</TypographyP>
              <TypographySmall className="text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </TypographySmall>
            </div>
          ))
        ) : (
          <TypographyP>No comments available for this product.</TypographyP>
        )}
      </div>
            <div className="fixed bottom-0 left-0 w-full h-max flex items-center gap-2 p-2 !pb-4 bg-[white] shadow-md border-t">
                <Button variant="outline" className="w-full mt-4" onClick={handleCreateChat}>Chat</Button>
                <Button variant="outline" className="w-full mt-4" onClick={handleAddToCart}>Add to Cart</Button>
            </div>
        </div>)
}