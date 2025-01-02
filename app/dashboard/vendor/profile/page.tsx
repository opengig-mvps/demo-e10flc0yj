"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle } from "lucide-react";
import api from "@/lib/api";

const profileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  contactInfo: z.string().min(1, "Contact information is required"),
  logoUrl: z.string().url("Please enter a valid URL").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const VendorProfile: React.FC = () => {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload = {
        businessName: data.businessName,
        contactInfo: data.contactInfo,
        logoUrl: data.logoUrl,
      };

      const response = await api.patch(
        `/api/vendors/${session?.user.id}/profile`,
        payload
      );

      if (response.data.success) {
        toast.success("Vendor profile updated successfully!");
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
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Vendor Profile</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                {...register("businessName")}
                placeholder="Enter business name"
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Textarea
                {...register("contactInfo")}
                placeholder="Enter contact information"
              />
              {errors.contactInfo && (
                <p className="text-red-500 text-sm">
                  {errors.contactInfo.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Business Logo URL</Label>
              <Input
                {...register("logoUrl")}
                placeholder="Enter logo URL"
              />
              {errors.logoUrl && (
                <p className="text-red-500 text-sm">{errors.logoUrl.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VendorProfile;