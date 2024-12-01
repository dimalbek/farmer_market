'use client';

import { useUser } from "@/contexts/user/context";
import { BuyerMainPage } from "@/widgets/Buyer";
import { FarmerMainPage } from "@/widgets/FarmerMainPage";
import Image from "next/image";
import { useEffect } from "react";

export const MainPage = () => {
    const { user } = useUser();

    useEffect(() => {
        console.log(user);
    }, [user]);

    return (
        <main
            className="m-auto w-full max-w-[500px] flex flex-col items-center gap-2 p-4"
            style={{
                backgroundImage: 'url("/images/background.jpg")',  
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',  
                minHeight: '100vh',  
            }}
        >
            {user?.role === "Admin" && (
                <Image
                    src="/images/farm.webp"
                    width={500}
                    height={300}
                    alt="Farm"
                    className="rounded-md"
                />
            )}
            {user?.role === "Farmer" && <FarmerMainPage />}
            {user?.role === "Buyer" && <BuyerMainPage />}
        </main>
    );
};
