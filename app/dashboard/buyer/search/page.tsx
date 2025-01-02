"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderCircleIcon } from "lucide-react";

const amenitiesOptions = ["WiFi", "Parking", "Pool", "Gym"];

const SearchPage = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<{ start: Date | undefined, end: Date | undefined }>({ start: undefined, end: undefined });
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/listings/search", {
        params: {
          location,
          startDate: selectedDates.start?.toISOString(),
          endDate: selectedDates.end?.toISOString(),
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          amenities,
          page: currentPage,
        },
      });
      setListings(response.data.data.listings);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [location, selectedDates, priceRange, amenities, currentPage]);

  const handleAmenityChange = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity]
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Search Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="space-y-4">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
          />
          <DateTimePicker
            date={selectedDates.start}
            setDate={(date: any) => setSelectedDates({ ...selectedDates, start: date })}
          />
          <DateTimePicker
            date={selectedDates.end}
            setDate={(date: any) => setSelectedDates({ ...selectedDates, end: date })}
          />
          <Slider
            defaultValue={priceRange}
            max={1000}
            step={10}
            onChange={(value: any) => setPriceRange(value)}
          />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Amenities</h2>
            {amenitiesOptions.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  checked={amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityChange(amenity)}
                />
                <label>{amenity}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoaderCircleIcon className="animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p>No results found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings?.map((listing: any) => (
                <Card key={listing?.listingId}>
                  <CardHeader>
                    <CardTitle>{listing?.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={listing?.images?.[0] ?? "/placeholder.svg"}
                      alt={listing?.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <p className="text-2xl font-bold">${listing?.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-2">{listing?.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={() => handlePageChange(index + 1)}
                    className={currentPage === index + 1 ? "font-bold" : ""}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={() => handlePageChange(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;