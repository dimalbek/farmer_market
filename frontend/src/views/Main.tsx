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
        <main className="relative w-full h-screen">
            {/* Conditionally Render Background Image */}
            {!user && (
                <Image
                    src="/images/background.jpg" // Replace with your background image path
                    alt="Background"
                    fill // Makes the image cover the parent element
                    className="object-cover -z-10" // Ensures it stays in the background
                />
            )}

            <div className="m-auto w-full max-w-[500px] flex flex-col items-center gap-2 p-4">
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
            </div>
        </main>
    );
};
