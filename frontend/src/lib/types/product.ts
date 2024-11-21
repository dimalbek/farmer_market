export type Product = {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    quantity: number;
    images: {
        image_url: string;
        id: number;
    }[];
    farmer_id: number;
}