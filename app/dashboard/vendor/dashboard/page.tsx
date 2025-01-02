"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Download, Mail, ShoppingCart, TrendingUp, Users, DollarSign } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-picker";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const VendorDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [listingsRes, bookingsRes, messagesRes, metricsRes, performanceRes] = await Promise.all([
          axios.get(`/api/vendors/${session?.user.id}/listings`),
          axios.get(`/api/vendors/${session?.user.id}/bookings`),
          axios.get(`/api/vendors/${session?.user.id}/messages`),
          axios.get(`/api/vendors/${session?.user.id}/metrics`),
          axios.get(`/api/vendors/${session?.user.id}/performance`),
        ]);

        setListings(listingsRes.data.data);
        setBookings(bookingsRes.data.data);
        setMessages(messagesRes.data.data);
        setMetrics(metricsRes.data.data);
        setPerformanceData(performanceRes.data.data);
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message ?? "Something went wrong");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleExport = async () => {
    try {
      const res = await axios.get(`/api/vendors/${session?.user.id}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Vendor Dashboard</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              <span className="text-3xl font-bold">{metrics?.totalListings ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
              <span className="text-3xl font-bold">{metrics?.totalBookings ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
              <span className="text-3xl font-bold">${metrics?.totalRevenue?.toFixed(2) ?? "0.00"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings?.map((listing: any) => (
                  <TableRow key={listing?.id}>
                    <TableCell>{listing?.title}</TableCell>
                    <TableCell>${listing?.price?.toFixed(2)}</TableCell>
                    <TableCell>{listing?.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking: any) => (
                  <TableRow key={booking?.id}>
                    <TableCell>{booking?.customerName}</TableCell>
                    <TableCell>{new Date(booking?.date).toLocaleDateString()}</TableCell>
                    <TableCell>{booking?.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages?.map((message: any) => (
                  <TableRow key={message?.id}>
                    <TableCell>{message?.customerName}</TableCell>
                    <TableCell>{message?.content}</TableCell>
                    <TableCell>{new Date(message?.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default VendorDashboard;