"use client";

import { FC, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import { FarmerProfile } from "@/lib/types/profile";
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

const farmerProfileFormSchema = z.object({
  farm_name: z.string().min(1, "Farm name is required"),
  location: z.string().min(1, "Location is required"),
  farm_size: z.number().min(0, "Farm size must be positive"),
});

type FarmerProfileFormValues = z.infer<typeof farmerProfileFormSchema>;

const FarmerProfileComponent: FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const profileForm = useForm<FarmerProfileFormValues>({
    resolver: zodResolver(farmerProfileFormSchema),
    defaultValues: {
      farm_name: "",
      location: "",
      farm_size: 0,
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

  const onSubmitCreateProfile = async (values: FarmerProfileFormValues) => {
    const token = JSON.parse(localStorage.getItem("token") || "{}");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/profiles/farmer/`,
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
        description: "Farmer profile created successfully!",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create farmer profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmitEditProfile = async (values: FarmerProfileFormValues) => {
    const token = JSON.parse(localStorage.getItem("token") || "{}");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/profiles/farmer/me`,
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
        description: "Farmer profile updated successfully!",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update farmer profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    if (isCreatingProfile) {
      return (
        <Card className="w-[calc(100%-2rem)] max-w-[500px]">
          <CardHeader>
            <CardTitle>Create Farmer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitCreateProfile)}
                className="w-full flex flex-col items-center gap-2"
              >
                <FormField
                  control={profileForm.control}
                  name="farm_name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Farm Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Farm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Farm Road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="farm_size"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Farm Size (in acres)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
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
      );
    } else {
      return (
        <Button onClick={() => setIsCreatingProfile(true)}>
          Create Farmer Profile
        </Button>
      );
    }
  } else {
    if (isEditingProfile) {
      profileForm.reset({
        farm_name: profile.farm_name || "",
        location: profile.location || "",
        farm_size: profile.farm_size || 0,
      });

      return (
        <Card className="w-[calc(100%-2rem)] max-w-[500px]">
          <CardHeader>
            <CardTitle>Edit Farmer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitEditProfile)}
                className="w-full flex flex-col items-center gap-2"
              >
                <FormField
                  control={profileForm.control}
                  name="farm_name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Farm Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Farm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Farm Road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="farm_size"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Farm Size (in acres)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
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
      );
    } else {
      return (
        <Card className="w-[calc(100%-2rem)] max-w-[500px]">
          <CardHeader>
            <CardTitle>Farmer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP>Farm Name: {profile.farm_name}</TypographyP>
            <TypographyP>Location: {profile.location}</TypographyP>
            <TypographyP>Farm Size: {profile.farm_size} acres</TypographyP>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="w-full"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Farmer Profile
            </Button>
          </CardFooter>
        </Card>
      );
    }
  }
};

export default FarmerProfileComponent;
