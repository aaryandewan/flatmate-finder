"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  city: z.string().min(1, { message: "Please select a city" }),
  rent: z.number().positive({ message: "Rent must be a positive number" }),
  genderPreference: z
    .string()
    .min(1, { message: "Please select a gender preference" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description must not exceed 500 characters" }),
  images: z
    .custom<FileList>()
    .refine((files) => files.length > 0, "At least one image is required")
    .transform((files) => Array.from(files))
    .refine(
      (files) => files.every((file) => file instanceof File),
      "Invalid file type"
    ),
});

export default function PostAdForm() {
  const { data: session } = useSession(); // Get the current user session
  const [busy, setBusy] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
      rent: undefined,
      genderPreference: "",
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviewUrls((prevUrls) => [...prevUrls, ...newImageUrls]);
      form.setValue("images", Array.from(files));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setBusy(true);
    try {
      const numberOfImages = values.images.length;

      // 1. Get signed URLs for image uploads
      const {
        data: { urls },
      } = await axios.get(`/api/upload?count=${numberOfImages}`);

      // 2. Upload the images to S3
      const uploadedImages = await Promise.all(
        values.images.map((file, index) =>
          axios.put(urls[index], file, {
            headers: { "Content-Type": file.type },
          })
        )
      );

      // 3. Extract the URLs from the signed URLs (ignore the query params)
      const imageUrls = urls.map((url) => url.split("?")[0]);

      // 4. Post the ad details (including image URLs) to the backend
      await axios.post("/api/ads", {
        city: values.city,
        rent: values.rent,
        genderPreference: values.genderPreference,
        description: values.description,
        images: imageUrls, // Send the uploaded image URLs to the backend
      });

      alert("Ad posted successfully!");
    } catch (error) {
      console.error("Error posting ad:", error);
      alert("Something went wrong while posting the ad.");
    }
    setBusy(false);
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Post Your Ad
          </CardTitle>
          <CardDescription className="text-center">
            Fill in the details below to post your flat for rent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* City Select */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Delhi", "Noida", "Mumbai", "Pune", "Bangalore"].map(
                          (city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rent Input */}
              <FormField
                control={form.control}
                name="rent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter the rent amount"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender Preference */}
              <FormField
                control={form.control}
                name="genderPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Male", "Female", "Male/Female"].map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your flat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Flat Images</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          handleImageChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {imagePreviewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <Button type="submit" disabled={busy}>
                  Post Ad
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
