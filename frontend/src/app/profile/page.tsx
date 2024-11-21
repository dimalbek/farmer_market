"use client";

import { FC, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user/context";
import { User } from "@/lib/types/user";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import FarmerProfileComponent from "@/widgets/FarmerProfile";
import BuyerProfileComponent from "@/widgets/BuyerProfile";

const formSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
});

const Page: FC = () => {
  const { user, saveUserData } = useUser();
  const { toast } = useToast();
  const navigate = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: user?.fullname || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    form.reset({
      fullname: user?.fullname || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const token = JSON.parse(localStorage.getItem("token") || "{}");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/auth/users/me`,
      {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    if (response.ok) {
      const updatedUser: { message: string; user: User } = await response.json();
      saveUserData(updatedUser.user);
      toast({
        title: "Success",
        description: updatedUser.message,
        variant: "default",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    saveUserData(null);
    navigate.push("/login");
  };

  return (
    <main className="w-full flex flex-col items-center gap-2">
      {user ? (
        <Card className="w-[calc(100%-2rem)] max-w-[500px]">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full flex flex-col items-center gap-2"
                >
                  <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 w-full items-center justify-end">
                    <Button className="w-full" type="submit">
                      Save Changes
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <>
                <TypographyP>Fullname: {user?.fullname}</TypographyP>
                <TypographyP>Email: {user?.email}</TypographyP>
                <TypographyP>Phone: {user?.phone?.slice(4)}</TypographyP>
                <TypographyP>Role: {user?.role}</TypographyP>
              </>
            )}
          </CardContent>
          <CardFooter className="flex w-full gap-2">
            {!isEditing && (
              <>
                <Button className="w-full" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Skeleton className="w-[500px] h-[300px] rounded-md" />
      )}

      {user?.role === "Farmer" && <FarmerProfileComponent />}

      {user?.role === "Buyer" && <BuyerProfileComponent />}
    </main>
  );
};

export default Page;
