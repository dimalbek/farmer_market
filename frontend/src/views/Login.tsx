'use client'

import { TypographyH1, TypographySmall } from "@/components/ui/typography"
import { LoginForm } from "@/widgets/login"
import { useRouter } from "next/navigation"

const Login = () => {
    const router = useRouter();

    return (
        <main className="w-full m-auto max-w-[500px] flex flex-col items-center gap-2 p-4">
            <TypographyH1>Login</TypographyH1>
            <LoginForm />
            <TypographySmall>
                Don&apos;t have an account? <a onClick={() => router.push("/signup")} className="text-blue-500 cursor-pointer">Sign up</a>
            </TypographySmall>
        </main>
    )
}


export default Login;