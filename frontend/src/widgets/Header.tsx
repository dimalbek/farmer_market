'use client'
import { Button } from "@/components/ui/button"
import { TypographyH4 } from "@/components/ui/typography"
import { useUser } from "@/contexts/user/context"
import Link from "next/link"
import { useRouter } from "next/navigation"

export const Header = () => {

    const {user} = useUser();
    const router = useRouter();

    const handleClick = () => {
        if (user){
            router.push("/profile")
        } else {
            router.push("/login")
        }
    }

    return (
        <header className="w-full flex gap-10 justify-start mb-4 items-center p-4 border-b shadow-md">
            <Link href="/"><TypographyH4>Farmus</TypographyH4></Link>
            <nav className="w-max flex items-center justify-start gap-2">
                {
                    user?.role === "Admin" && <Link className="underline" href="/dashboard">Dashboard</Link>
                }
            </nav>
            <Button className="mr-0 ml-auto" onClick={handleClick}>{user ? `Profile` : "Login"}</Button>
        </header>
    )
}