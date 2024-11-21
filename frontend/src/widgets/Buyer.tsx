import { Card, CardContent } from "@/components/ui/card";
import {
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographySmall,
} from "@/components/ui/typography";
import { Product } from "@/lib/types/product";
import { useEffect, useState } from "react";
import { ImageCarousel } from "./ImageCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export const BuyerMainPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();

  const categories = [
    "All",
    "Seeds",
    "Meat",
    "Equipment",
    "Dairy",
    "Vegetables",
    "Fruits",
  ];

  const handleProductClick = (productId: number) => {
    router.push(`/products/${productId}`);
  }

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product: Product) => {
    const matchesCategory =
      selectedCategory === "All" ? true : product.category === selectedCategory;
    const matchesSearchTerm = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearchTerm;
  });

  return (
    <section className="w-full flex flex-col items-center gap-2">
      <TypographyH3 className="text-center">Products</TypographyH3>
      <div className="w-full">
        <Input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-[16px] mb-4"
        />
      </div>
      <div className="w-full flex flex-wrap  items-center gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            onClick={() => setSelectedCategory(category)}
            className="cursor-pointer"
          >
            {category}
          </Badge>
        ))}
      </div>
      <div className="overflow-y-scroll w-full flex flex-col items-center gap-2">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product: Product) => (
          <Card
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="w-full !border-0 max-w-3xl p-0 shadow-sm rounded-lg"
          >
            <CardContent className="flex flex-row gap-4 p-4 items-start">
              <div className="w-1/3">
                <ImageCarousel images={product.images} />
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
                </div>
                <div className="flex items-center justify-between">
                  <TypographyH4>
                    {product.price} ₸
                  </TypographyH4>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Skeleton className="w-full max-w-md h-64 rounded-md" />
      )}
      </div>
      
    </section>
  );
};
