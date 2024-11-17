'use client'

import { Button } from "@/components/ui/button"
import { TypographyH1 } from "@/components/ui/typography"
import { useUser } from "@/contexts/user/context"
import { BuyerMainPage } from "@/widgets/Buyer"
import { FarmerMainPage } from "@/widgets/FarmerMainPage"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const Main = () => {

    const {user} = useUser()

    useEffect(() => {
        console.log(user)
    }, [user])

    const router = useRouter();

    return (
        <main className="m-auto w-full max-w-[500px] flex flex-col items-center gap-2 p-4">
            {
                user?.role === "Admin" && (<Image src="/images/farm.webp" width={500} height={300} alt="Farm" className="rounded-md" />)
            }
            {
                user?.role === "Farmer" && (<FarmerMainPage />)
            }
            {
                user?.role === "Buyer" && (<BuyerMainPage />)
            }
        </main>
    )
}