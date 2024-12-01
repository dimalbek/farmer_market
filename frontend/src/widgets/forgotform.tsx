'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user/context";
import { User } from "@/lib/types/user";
import { useState } from "react"



const formSchema = z.object({
    email: z.string().email()
  })

export const ResetForm = () => {
    const {toast} = useToast();
    const {saveUserData} = useUser()
    const [email, setEmail] = useState("")
    const [isFilling, setIsFilling] = useState(true)
    const [password, setPassword] = useState("")
    const [code, setCode] = useState("")
    const navigate = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        },
      })

      const handleCheckCode = async (thecode: string) => {
        
        if (thecode.length === 6) {
            setCode(thecode)
        }
      }
     
      async function onSubmit(values: z.infer<typeof formSchema>) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/auth/users/password-reset/initiate`, {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const body = await response.json()
        if (response.ok) {
            toast({
              title: "Success",
              description: "We sent you an email with a code to confirm your login",
              variant: "default"
            });
              setEmail(values.email);
              setIsFilling(false);
          } else {
            toast({
              title: "Error",
              description: body.detail,
              variant: "destructive",
            });
          }
        

      }

      async function handleResetPassword() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/auth/users/password-reset/confirm`, {
            method: "POST",
            body: JSON.stringify({
                email: email,
              code: code,
              new_password: password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const body = await response.json()
        if (response.ok) {
            localStorage.setItem("token", JSON.stringify(body));
            toast({
              title: "Success",
              description: "User logged in successfully!",
              variant: "default"
            });
            fetch(`${process.env.NEXT_PUBLIC_BACKEND}/auth/users/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${body.access_token}`,
                'ngrok-skip-browser-warning': 'true'
              },
            })
              .then(response => response.json())
              .then((data: User) => {
                saveUserData(data);
                navigate.push("/")
              })
              .catch(error => {
                console.error('Error fetching user data:', error);
              });
          } else {
            toast({
              title: "Error",
              description: body.detail,
              variant: "destructive",
            });
          }
        
      }
    
    return (<>
    {
      isFilling ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col items-center gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">Submit</Button>
          </form>
        </Form>
      ) :(
        <div className="w-full flex flex-col items-center gap-2">
            <InputOTP onChange={handleCheckCode} maxLength={6}>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
            </InputOTP>
            {
                true && <div className="w-full flex flex-col items-center gap-2">
                    <Input placeholder="New password" className="mx-4" onChange={(e) => setPassword(e.target.value)} type="text" value={password} />
                    <Button className="w-full" onClick={handleResetPassword}>Reset password</Button>
                </div>
            }
        </div>
      )
    }
    </>)
}