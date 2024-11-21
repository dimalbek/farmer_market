'use client'

import { TypographyH1, TypographySmall } from "@/components/ui/typography"
import { RegistrationForm } from "@/widgets/regaform"
import { useRouter } from "next/navigation"

const Registration = () => {
    const router = useRouter();

    return (
        <main className="w-full m-auto max-w-[500px] flex flex-col items-center gap-2 p-4">
            <TypographyH1>Sign up</TypographyH1>
            <RegistrationForm />
            <TypographySmall >Already have an account? <a onClick={() => router.push("/login")} className="text-blue-500 cursor-pointer">Login</a></TypographySmall>
        </main>
    )
}


export default Registration;