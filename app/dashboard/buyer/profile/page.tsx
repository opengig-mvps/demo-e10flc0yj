'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import api from '@/lib/api';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoaderCircleIcon } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  paymentDetails: z.object({
    cardNumber: z.string().min(16, 'Invalid card number'),
    expiryDate: z.string().min(5, 'Invalid expiry date'),
    cvv: z.string().min(3, 'Invalid CVV'),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const BuyerProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [bookings, setBookings] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!session) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/buyers/${session?.user.id}/bookings`);
        setBookings(res.data.data);
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        paymentDetails: data.paymentDetails,
      };

      const response = await api.patch(
        `/api/buyers/${session?.user.id}/profile`,
        payload
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Management</h1>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input {...register('name')} placeholder="Enter your name" />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input {...register('email')} placeholder="Enter your email" />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input {...register('phone')} placeholder="Enter your phone number" />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input {...register('paymentDetails.cardNumber')} placeholder="Enter your card number" />
              {errors.paymentDetails?.cardNumber && (
                <p className="text-red-500 text-sm">{errors.paymentDetails?.cardNumber?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input {...register('paymentDetails.expiryDate')} placeholder="MM/YY" />
              {errors.paymentDetails?.expiryDate && (
                <p className="text-red-500 text-sm">{errors.paymentDetails?.expiryDate?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input {...register('paymentDetails.cvv')} placeholder="Enter your CVV" />
              {errors.paymentDetails?.cvv && (
                <p className="text-red-500 text-sm">{errors.paymentDetails?.cvv?.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Booking History</h2>
        {loading ? (
          <div className="flex justify-center">
            <LoaderCircleIcon className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking: any) => (
                <TableRow key={booking?.id}>
                  <TableCell>{booking?.id}</TableCell>
                  <TableCell>{booking?.listing?.title}</TableCell>
                  <TableCell>{new Date(booking?.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking?.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{booking?.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default BuyerProfilePage;