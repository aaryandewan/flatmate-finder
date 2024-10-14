"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; // Import the Link component

import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Import Shadcn Skeleton
import { useSession } from "next-auth/react"; // For fetching session data

export default function FlatsPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    gender: "",
    city: "",
    rent: "",
  });
  const [displayedFlats, setDisplayedFlats] = useState([]);
  const [loading, setLoading] = useState(true); // Initially set loading to true

  // Fetch flats based on the selected filters
  const handleSearch = async () => {
    setLoading(true); // Set loading state to true when fetching data
    try {
      const response = await axios.get("/api/flats/filter", {
        params: {
          city: filters.city,
          gender: filters.gender,
          rent: filters.rent,
        },
      });
      setDisplayedFlats(response.data.flats);
    } catch (error) {
      console.error("Error fetching flats:", error);
    } finally {
      setLoading(false); // Stop loading once the data is fetched
    }
  };
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session) {
        try {
          // Assuming you have an endpoint to get the logged-in user profile
          const response = await axios.get(`/api/users/${session?.user?.id}`);
          const userCity = response.data.data.location || "Delhi"; // Fallback to 'Delhi' if city is not available
          setFilters((prev) => ({ ...prev, city: userCity }));
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setFilters((prev) => ({ ...prev, city: "Delhi" })); // Default city if no session found
      }
    };

    fetchUserProfile();
  }, [session]);

  // Fetch all flats in a city when the city changes
  useEffect(() => {
    const fetchFlats = async () => {
      setLoading(true); // Show loading state when the page loads
      try {
        const response = await axios.get("/api/flats", {
          params: { city: filters.city },
        });
        setDisplayedFlats(response.data.flats);
      } catch (error) {
        console.error("Error fetching flats:", error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };
    fetchFlats();
  }, [filters.city]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center">
        {filters.city ? `Find Roommates in ${filters.city}` : "Find Roomates"}
      </h1>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Filters</h2>
        <div className="flex flex-wrap justify-center items-end gap-4">
          <div className="w-full sm:w-auto">
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, gender: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male/Female">Male/Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, city: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
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
          </div>

          <div className="w-full sm:w-auto">
            <Input
              type="number"
              placeholder="Max Rent (₹)"
              className="w-full sm:w-[180px]"
              value={filters.rent}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, rent: e.target.value }))
              }
            />
          </div>

          <Button onClick={handleSearch} className="w-full sm:w-auto">
            Search
          </Button>
        </div>
      </div>

      {/* Display Skeletons while loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Display "No flats found" message if no results */}
          {displayedFlats.length === 0 ? (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">
                Sorry, no flats found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedFlats.map((flat) => (
                <Link href={`/flats/${flat._id}`} key={flat._id}>
                  <Card key={flat._id} className="overflow-hidden">
                    <img
                      src={flat.images[0]} // Display the first image of the flat
                      alt={`Flat in ${flat.city}`}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      s<p className="text-2xl font-bold mb-2">₹{flat.rent}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">
                          {flat.genderPreference}
                        </Badge>
                        <p className="text-sm text-gray-600">{flat.city}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
