export type Chat = {
    id: string;
    buyer_id: string;
    farmer_id: string;
    message: Message[];
}

export type Message = {
    sender_id: string;
    content: string;
}