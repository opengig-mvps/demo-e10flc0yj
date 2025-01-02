"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Plus, X, LoaderCircle, Trash, Edit, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import api from "@/lib/api";

const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Please enter a valid positive number"
  ),
  availability: z.array(
    z.object({
      startDateTime: z.date({
        required_error: "Start date and time is required",
      }),
      endDateTime: z.date({
        required_error: "End date and time is required",
      }),
    }).refine((data) => data.startDateTime < data.endDateTime, {
      message: "Start time must be before end time",
      path: ["endDateTime"],
    })
  ).min(1, "At least one availability is required"),
  amenities: z.string().min(1, "Amenities are required"),
  images: z.array(z.any()).min(1, "At least one image is required"),
});

type ListingFormData = z.infer<typeof listingSchema>;

const ListingsPage: React.FC = () => {
  const { data: session } = useSession();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      availability: [{ startDateTime: undefined, endDateTime: undefined }],
      images: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "availability",
  });

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/listings`);
      setListings(res.data.data.listings);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onSubmit = async (data: ListingFormData) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        availability: data.availability.map((slot) => ({
          startTime: slot.startDateTime.toISOString(),
          endTime: slot.endDateTime.toISOString(),
        })),
        amenities: data.amenities,
        images: data.images,
      };

      const response = await api.post("/api/listings", payload);

      if (response.data.success) {
        toast.success("Listing created successfully!");
        fetchListings();
        reset();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleEdit = (listing: any) => {
    setSelectedListing(listing);
    reset({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      availability: listing.availability.map((slot: any) => ({
        startDateTime: new Date(slot.startTime),
        endDateTime: new Date(slot.endTime),
      })),
      amenities: listing.amenities,
      images: listing.images,
    });
  };

  const handleDelete = async (listingId: string) => {
    try {
      const response = await api.delete(`/api/listings/${listingId}`);

      if (response.data.success) {
        toast.success("Listing deleted successfully!");
        fetchListings();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Listings</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{selectedListing ? "Edit Listing" : "Create New Listing"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input {...register("title")} placeholder="Enter title" />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...register("description")}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                {...register("price")}
                type="number"
                placeholder="Enter price"
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Availability</Label>
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      startDateTime: new Date(),
                      endDateTime: new Date(),
                    })
                  }
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slot
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Slot {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date Time</Label>
                      <DateTimePicker
                        date={field.startDateTime}
                        setDate={(date) => {
                          if (!date) return;
                          update(index, {
                            startDateTime: date,
                            endDateTime: field.endDateTime,
                          });
                        }}
                      />
                      {errors.availability?.[index]?.startDateTime && (
                        <p className="text-red-500 text-sm">
                          {errors.availability[index]?.startDateTime?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>End Date Time</Label>
                      <DateTimePicker
                        date={field.endDateTime}
                        setDate={(date) => {
                          if (!date) return;
                          update(index, {
                            startDateTime: field.startDateTime,
                            endDateTime: date,
                          });
                        }}
                      />
                      {errors.availability?.[index]?.endDateTime && (
                        <p className="text-red-500 text-sm">
                          {errors.availability[index]?.endDateTime?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities</Label>
              <Input
                {...register("amenities")}
                placeholder="Enter amenities"
              />
              {errors.amenities && (
                <p className="text-red-500 text-sm">{errors.amenities.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              <Input
                {...register("images")}
                type="file"
                multiple
              />
              {errors.images && (
                <p className="text-red-500 text-sm">{errors.images.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  {selectedListing ? "Updating Listing..." : "Creating Listing..."}
                </>
              ) : (
                selectedListing ? "Update Listing" : "Create Listing"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Existing Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings?.map((listing) => (
            <Card key={listing?.listingId} className="flex flex-col">
              <CardHeader>
                <CardTitle>{listing?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {listing?.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: ${listing?.price}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amenities: {listing?.amenities}
                </p>
              </CardContent>
              <CardFooter className="mt-auto flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(listing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the listing.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => handleDelete(listing?.listingId)}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListingsPage;