
'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Product } from "@/lib/types/product";
import { FarmerProfile } from "@/lib/types/profile";
import { ImageCarousel } from "@/widgets/ImageCarousel";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


interface Farmer  {
    id: string;
    fullname: string;
    email: string;
    phone: string;
    role: "Admin" | "Buyer" | "Farmer";
    profile: FarmerProfile;
}

export const ProductPage = () => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [farmerProfile, setFarmerProfile] = useState<Farmer | null>(null);
    const params = useParams();
    console.log(params)
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
    console.log(farmerProfile)

    useEffect(() => {

        const fetchFarmerProfile = async () => {
            try {
                const token = JSON.parse(localStorage.getItem("token") || "{}");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND}/profiles/${product?.farmer_id || 1}`,
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

    
    
    if (loading) {
        return <Skeleton />;
    }
    
    if (error) {
        return <TypographyP>{error}</TypographyP>;
    }
    
    return (
        <div className="flex flex-col items-center gap-2 px-4">
            <ImageCarousel images={product?.images || []} width={256} height={256} />
            <div className="w-full flex flex-col items-start gap-2 border-y">
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
            
            <Button className="w-full mt-4">Add to Cart</Button>
        </div>)
}