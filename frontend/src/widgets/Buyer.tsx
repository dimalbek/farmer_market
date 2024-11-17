import { TypographyH4, TypographyP } from "@/components/ui/typography"
import { Product } from "@/lib/types/product"
import { LayoutListIcon, MessageCircle, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"


export const BuyerMainPage = () => {

    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/products`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            });
            const data = await response.json();
            setProducts(data);
        }
        fetchProducts();
    }, [])

    return (
        <section className="w-full flex flex-col items-center gap-2">
            <div className="w-full flex items-center gap-2" >
                
            </div>
        </section>
    )
}