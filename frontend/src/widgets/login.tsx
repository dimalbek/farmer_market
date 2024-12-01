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
    email: z.string().email(),
    password: z.string().min(6)
  })

export const LoginForm = () => {
    const {toast} = useToast();
    const {saveUserData} = useUser()
    const [email, setEmail] = useState("")
    const [isFilling, setIsFilling] = useState(true)
    const navigate = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
      })

      const handleCheckCode = async (thecode: string) => {
        
        if (thecode.length === 6) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/auth/users/login/confirm`, {
            method: "POST",
            body: JSON.stringify({
              email: email,
              code: thecode
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
      }
     
      async function onSubmit(values: z.infer<typeof formSchema>) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/auth/users/login/initiate`, {
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">Submit</Button>
          </form>
        </Form>
      ) :(
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

      )
    }
    </>)
}