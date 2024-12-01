export type FarmerProfile = {
    id: string;
    farm_name: string;
    user_id: string;
    location: string;
    farm_size: number;
    is_approved: "approved" | "pending" | "rejected";
}

export type BuyerProfile = {
    id: string;
    delivery_address: string;
}