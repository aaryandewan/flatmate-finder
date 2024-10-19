"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import axios from "axios";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FlatDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();

  const router = useRouter();
  const [flatData, setFlatData] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch the flat details based on the flat ID
  useEffect(() => {
    const fetchFlatDetails = async () => {
      try {
        const response = await axios.get(`/api/flats/${params.id}`);
        setFlatData(response.data);
      } catch (error) {
        console.error("Error fetching flat details:", error);
        router.push("/flats"); // Redirect to /flats if flat not found or error occurs
      }
    };
    fetchFlatDetails();
  }, [params.id, router]);

  if (!flatData) {
    return <p>Loading flat details...</p>; // Loading state while fetching data
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === flatData.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? flatData.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/flats"
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Link>
        <Badge variant="secondary">{flatData.genderPreference}</Badge>
      </div>
      {/* <p>User ID: {session?.user.id}</p> */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{flatData.title}</h1>
            <p className="text-xl font-semibold">
              ₹{flatData.rent.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="md:row-span-2">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={flatData.images[currentImageIndex]}
              alt={`Flat image ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Flat Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm">{flatData.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">City</h3>
                  <p>{flatData.city}</p>
                </div>
                {/* <div>
                  <h3 className="font-semibold mb-2">Posted By</h3>
                  <p>{flatData.postedBy.name}</p>
                </div> */}
              </div>
            </div>
          </CardContent>
        </div>

        <div className="md:col-start-2 space-y-4">
          <Button asChild className="w-full">
            {/* <a href={`tel:${flatData.postedBy.contactNumber}`}> */}
            <Link
              href={{
                pathname: "/message",
                query: {
                  senderId: session?.user.id,
                  ownerId: flatData.ownerId,
                },
              }}
            >
              Message Owner
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
