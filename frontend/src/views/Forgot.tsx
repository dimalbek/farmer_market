'use client'

import { TypographyH1, TypographySmall } from "@/components/ui/typography"
import { ResetForm } from "@/widgets/forgotform"
import { useRouter } from "next/navigation"

const Forgot = () => {
    const router = useRouter();

    return (
        <main className="w-full m-auto max-w-[500px] flex flex-col items-center gap-2 p-4">
            <TypographyH1>Reset password</TypographyH1>
            <ResetForm />
        </main>
    )
}


export default Forgot;