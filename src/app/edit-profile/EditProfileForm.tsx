"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation"; // Import useRouter
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import axios from "axios"; // For API calls
import { ScrollArea } from "@/components/ui/scroll-area";

import { useSession } from "next-auth/react"; // To get user session
import { useToast } from "@/hooks/use-toast"; // For toast notifications

const formSchema = z.object({
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  hobbies: z.array(z.string()).min(1, {
    message: "Please select at least one hobby.",
  }),

  expectedRent: z.string().regex(/^\d+$/, {
    message: "Expected rent must be a number.",
  }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Please enter a valid phone number.",
  }),
  instagramHandle: z.string().regex(/^@?[\w.]+$/, {
    message: "Please enter a valid Instagram handle.",
  }),
});

const hobbyOptions = [
  "Gymming",
  "Cycling",
  "Dining Out",
  "Reading",
  "Traveling",
  "Photography",
  "Cooking",
  "Hiking",
  "Painting",
  "Gaming",
  "Yoga",
  "Dancing",
  "Gardening",
];

export default function EditProfileForm({ user }: { user: any }) {
  const { data: session } = useSession(); // Get the session
  const { toast } = useToast(); // To show toast notifications
  const router = useRouter();

  // Pre-fill the form with existing data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: user.location || "", // Pre-fill with user's location
      expectedRent: user.expectedRent || "", // Pre-fill with expected rent
      hobbies: user.hobbies || [],
      phoneNumber: user.phoneNumber || "", // Pre-fill with phone number
      instagramHandle: user.instagramHandle || "", // Pre-fill with Instagram handle
    },
  });

  const [profileImage, setProfileImage] = useState(
    user.profilePicture || "/placeholder.svg"
  );
  const [imageFile, setImageFile] = useState<File | null>(null); // To hold the selected image file
  const [isBusy, setIsBusy] = useState(false);

  // Function to handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the image file to upload later
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string); // Preview the image
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsBusy(true);
    let profilePictureUrl = user.profilePicture; // Keep existing picture if no new picture is uploaded

    // If a new image is selected, upload it to S3
    if (imageFile) {
      try {
        // Get the signed URL from the backend
        console.log("Final profile pic = ", profilePictureUrl);
        const { data: signedUrlData } = await axios.get("/api/upload?count=1");
        const signedUrl = signedUrlData.urls[0];
        // Use the signed URL to upload the image file to S3
        await axios.put(signedUrl, imageFile, {
          headers: {
            "Content-Type": imageFile.type,
            // "x-amz-acl": "public-read",
          }, // Set the correct content type
        });

        // Save the image URL from S3 (without the signed part)
        profilePictureUrl = signedUrl.split("?")[0];
      } catch (error) {
        toast({
          title: "Error",
          description: "There was an issue uploading the profile picture.",
          variant: "destructive",
        });
        console.error("Error uploading image:", error);
        return;
      }
    }

    // Update the user's profile with the new data and profile picture URL
    axios
      .put(`/api/users/${session?.user?.id}`, {
        ...values,
        profilePicture: profilePictureUrl, // Include the image URL in the profile update
      })
      .then((response) => {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        console.log("Profile updated:", response.data);
        setIsBusy(false);
        router.refresh();
      })
      .catch((error) => {
        toast({
          title: "Error",
          description:
            "There was an issue updating your profile. Please try again.",
          variant: "destructive",
        });
        console.error("Error updating profile:", error);
      });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Edit Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src={profileImage} alt="Profile picture" />
              <AvatarFallback>UP</AvatarFallback>
            </Avatar>
            <Label
              htmlFor="picture"
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Update Picture
            </Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Delhi",
                            "Noida",
                            "Mumbai",
                            "Pune",
                            "Bangalore",
                          ].map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hobbies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hobbies</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <ScrollArea className="h-20 w-full border rounded-md p-2">
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((hobby) => (
                              <Badge
                                key={hobby}
                                variant="secondary"
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                                onClick={() => {
                                  const newValue = field.value.filter(
                                    (h) => h !== hobby
                                  );
                                  form.setValue("hobbies", newValue);
                                }}
                              >
                                {hobby} ✕
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                        <ScrollArea className="h-20 w-full border rounded-md p-2">
                          <div className="flex flex-wrap gap-2">
                            {hobbyOptions
                              .filter((hobby) => !field.value.includes(hobby))
                              .map((hobby) => (
                                <Badge
                                  key={hobby}
                                  variant="outline"
                                  className="bg-background hover:bg-secondary/80 cursor-pointer"
                                  onClick={() => {
                                    const newValue = [...field.value, hobby];
                                    form.setValue("hobbies", newValue);
                                  }}
                                >
                                  {hobby}
                                </Badge>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Rent</FormLabel>
                    <FormControl>
                      <Input
                        type="string"
                        placeholder="Enter expected rent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagramHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Instagram handle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isBusy}>
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
