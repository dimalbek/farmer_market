"use client";

import { FC } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Quantity must be at least 1")
  ),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Price must be at least 0")
  ),
  images: z.array(z.instanceof(File)).optional(),
});

const NewProductPage: FC = () => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      category: "",
      description: "",
      price: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    const token = JSON.parse(localStorage.getItem("token") || "{}");
    if (token) {
      try {
        const formData = new FormData();

        // Append form data
        formData.append("name", values.name);
        formData.append("quantity", values.quantity.toString());
        formData.append("category", values.category);
        formData.append("description", values.description || "");
        formData.append("price", values.price.toString());

        if (values.images && values.images.length > 0) {
          Array.from(values.images).forEach((file: File) =>
            formData.append("images", file)
          );
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/products`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const body = await response.json();
        if (response.ok) {
          toast({
            title: "Success",
            description: "Product created successfully",
            variant: "default",
          });

          form.reset();
        } else {
          toast({
            title: "Error",
            description: body.detail || "Failed to create product",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <main className="w-full flex flex-col items-center gap-2">
      <Card className="w-[calc(100%-2rem)] mx-4 max-w-[500px]">
        <CardHeader>
          <CardTitle>New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex flex-col items-center gap-2"
            >
              {/* Existing Fields */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Quantity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Seeds">Seeds</SelectItem>
                        <SelectItem value="Meat">Meat</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Vegetables">Vegetables</SelectItem>
                        <SelectItem value="Fruits">Fruits</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Images Field */}
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      form.setValue(
                        "images",
                        e.target.files ? Array.from(e.target.files) : []
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <div className="flex gap-2 w-full items-center justify-end">
                <Button className="w-full" type="submit">
                  Create Product
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
};

export default NewProductPage;
