"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoaderCircleIcon } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";

const BuyerDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pastReservations, setPastReservations] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<{ start: Date | undefined, end: Date | undefined }>({ start: undefined, end: undefined });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch profile data
      const profileRes = await axios.get(`/api/users/${session?.user.id}/profile`);
      setProfile(profileRes.data.data);

      // Fetch upcoming bookings, recent activities, past reservations, payment methods, and recommendations
      const bookingsRes = await axios.get(`/api/users/${session?.user.id}/bookings/upcoming`);
      setUpcomingBookings(bookingsRes.data.data);

      const activitiesRes = await axios.get(`/api/users/${session?.user.id}/activities/recent`);
      setRecentActivities(activitiesRes.data.data);

      const pastRes = await axios.get(`/api/users/${session?.user.id}/reservations/past`);
      setPastReservations(pastRes.data.data);

      const paymentRes = await axios.get(`/api/users/${session?.user.id}/payment-methods`);
      setPaymentMethods(paymentRes.data.data);

      const recommendationsRes = await axios.get(`/api/users/${session?.user.id}/recommendations`);
      setRecommendations(recommendationsRes.data.data);
    } catch (error: any) {
      if (isAxiosError(error)) {
        console.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const handleProfileUpdate = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.patch(`/api/buyers/${session?.user.id}/profile`, { paymentDetails: profile.paymentDetails });
      if (response.data.success) {
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
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

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Buyer Dashboard</h2>
      {loading && <LoaderCircleIcon className="animate-spin" />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingBookings?.map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.title}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {recentActivities?.map((activity: any) => (
                <li key={activity.id}>{activity.description}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastReservations?.map((reservation: any) => (
                  <TableRow key={reservation.id}>
                    <TableCell>{new Date(reservation.date).toLocaleDateString()}</TableCell>
                    <TableCell>{reservation.title}</TableCell>
                    <TableCell>{reservation.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {paymentMethods?.map((method: any) => (
                <li key={method.id}>{method.type}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {recommendations?.map((recommendation: any) => (
                <li key={recommendation.id}>{recommendation.title}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-2">
                <label htmlFor="paymentDetails">Payment Details</label>
                <Textarea
                  id="paymentDetails"
                  value={profile?.paymentDetails}
                  onChange={(e) => setProfile({ ...profile, paymentDetails: e.target.value })}
                />
              </div>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <LoaderCircleIcon className="animate-spin" /> : "Update Profile"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerDashboard;