export type User = {
    id: string;
    fullname: string;
    email: string;
    phone: string;
    role: "Admin" | "Buyer" | "Farmer";
    
}