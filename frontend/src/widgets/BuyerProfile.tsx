"use client";

import { FC, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import { BuyerProfile } from "@/lib/types/profile";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const buyerProfileFormSchema = z.object({
  delivery_address: z.string().min(1, "Delivery address is required"),
});

type BuyerProfileFormValues = z.infer<typeof buyerProfileFormSchema>;

const BuyerProfileComponent: FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const router = useRouter();

  const profileForm = useForm<BuyerProfileFormValues>({
    resolver: zodResolver(buyerProfileFormSchema),
    defaultValues: {
      delivery_address: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = JSON.parse(localStorage.getItem("token") || "{}");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/profiles/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  const onSubmitCreateProfile = async (values: BuyerProfileFormValues) => {
    const token = JSON.parse(localStorage.getItem("token") || "{}");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/profiles/buyer/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(values),
      }
    );
    if (response.ok) {
      const data = await response.json();
      setProfile(data);
      setIsCreatingProfile(false);
      toast({
        title: "Success",
        description: "Buyer profile created successfully!",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create buyer profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmitEditProfile = async (values: BuyerProfileFormValues) => {
    const token = JSON.parse(localStorage.getItem("token") || "{}");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/profiles/buyer/me`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(values),
      }
    );
    if (response.ok) {
      const data = await response.json();
      setProfile(data);
      setIsEditingProfile(false);
      toast({
        title: "Success",
        description: "Buyer profile updated successfully!",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update buyer profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="w-full flex flex-col items-center gap-6">
       
      {!profile ? (
        isCreatingProfile ? (
          <Card className="w-[calc(100%-2rem)] max-w-[500px]">
            <CardHeader>
              <CardTitle>Create Buyer Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onSubmitCreateProfile)}
                  className="w-full flex flex-col items-center gap-2"
                >
                  <FormField
                    control={profileForm.control}
                    name="delivery_address"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 w-full items-center justify-end">
                    <Button className="w-full" type="submit">
                      Create Profile
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => setIsCreatingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setIsCreatingProfile(true)}>
            Create Buyer Profile
          </Button>
        )
      ) : isEditingProfile ? (
        <Card className="w-[calc(100%-2rem)] max-w-[500px]">
          <CardHeader>
            <CardTitle>Edit Buyer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitEditProfile)}
                className="w-full flex flex-col items-center gap-2"
              >
                <FormField
                  control={profileForm.control}
                  name="delivery_address"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
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
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-[calc(100%-2rem)] max-w-[500px]">
          <CardHeader>
            <CardTitle>Buyer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP>
              Delivery Address: {profile.delivery_address}
            </TypographyP>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="w-full"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Buyer Profile
            </Button>
          </CardFooter>
        </Card>
      )}
      <div className="w-[calc(100%-2rem)] max-w-[500px] flex justify-center">
        <Button
          className="w-full"
          onClick={() => router.push("/orders")}
        >
          My Orders
        </Button>
      </div>
    </section>
  );
};

export default BuyerProfileComponent;