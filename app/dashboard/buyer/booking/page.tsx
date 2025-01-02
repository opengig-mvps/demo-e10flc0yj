'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-picker';
import { LoaderCircleIcon } from 'lucide-react';
import api from '@/lib/api';
import axios from 'axios';

const bookingSchema = z.object({
  listingId: z.string().min(1, { message: 'Listing ID is required' }),
  startDate: z.date(),
  endDate: z.date(),
  paymentId: z.string().min(1, { message: 'Payment ID is required' }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const payload = {
        listingId: data.listingId,
        userId: session.user.id,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        paymentId: data.paymentId,
      };

      const response = await api.post('/api/bookings', payload);

      if (response.data.success) {
        toast.success('Booking created successfully!');
        router.push('/dashboard/buyer/bookings');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Book a Homestay or Experience</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="listingId">Listing ID</Label>
              <Input {...register('listingId')} placeholder="Enter listing ID" />
              {errors.listingId && <p className="text-red-500 text-sm">{errors.listingId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value, onChange } }) => (
                  <DateTimePicker
                    date={value}
                    setDate={onChange}
                  />
                )}
              />
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { value, onChange } }) => (
                  <DateTimePicker
                    date={value}
                    setDate={onChange}
                  />
                )}
              />
              {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentId">Payment ID</Label>
              <Input {...register('paymentId')} placeholder="Enter payment ID" />
              {errors.paymentId && <p className="text-red-500 text-sm">{errors.paymentId.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Book Now'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default BookingPage;