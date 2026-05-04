import { useState } from "react";
import { useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, ArrowRight, CheckCircle2, IndianRupee, Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service, City } from "@shared/schema";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  city: z.string().min(1, "Please select a city"),
  address: z.string().min(5, "Address is required"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM",
];

export default function Book() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const preselectedService = urlParams.get("service") || "";
  const { toast } = useToast();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: cities } = useQuery<City[]>({ queryKey: ["/api/cities"] });

  const selectedServiceId = preselectedService;

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      city: "",
      address: "",
      scheduledDate: "",
      scheduledTime: "",
      notes: "",
    },
  });

  const selectedService = services?.find(s => s.id === selectedServiceId);
  const unitPrice = selectedService ? (selectedService.discountPrice || selectedService.price) : 0;
  const totalAmount = unitPrice * quantity;

  const mutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const servicesData = [{
        serviceId: selectedServiceId,
        name: selectedService?.name || "",
        quantity,
        price: unitPrice,
      }];
      const res = await apiRequest("POST", "/api/bookings", {
        ...data,
        serviceId: selectedServiceId,
        servicesJson: JSON.stringify(servicesData),
        totalAmount,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      setBookingSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create booking. Please try again.", variant: "destructive" });
    },
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/payments/create-order", { bookingId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.razorpayOrderId) {
        openRazorpay(data);
      } else {
        toast({ title: "Payment", description: "Payment gateway is being configured. Please contact support.", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Info", description: "Payment gateway is being set up. You can pay later.", variant: "destructive" });
    },
  });

  const openRazorpay = (orderData: any) => {
    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount,
      currency: "INR",
      name: "HomesSolution",
      description: `Booking #${bookingId.slice(0, 8)}`,
      order_id: orderData.razorpayOrderId,
      handler: async (response: any) => {
        try {
          await apiRequest("POST", "/api/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId,
          });
          toast({ title: "Payment Successful", description: "Your booking has been confirmed!" });
          queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        } catch {
          toast({ title: "Payment verification failed", description: "Please contact support.", variant: "destructive" });
        }
      },
      prefill: {
        name: form.getValues("customerName"),
        email: form.getValues("customerEmail"),
        contact: form.getValues("customerPhone"),
      },
      theme: { color: "#2563EB" },
    };

    const win = window as any;
    if (win.Razorpay) {
      const rzp = new win.Razorpay(options);
      rzp.open();
    } else {
      toast({ title: "Loading payment gateway...", description: "Please wait a moment and try again." });
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold mb-2" data-testid="text-booking-confirmed">Booking Confirmed!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your booking has been created successfully. Booking ID: <span className="font-mono font-semibold">{bookingId.slice(0, 8)}</span>
          </p>
          <div className="bg-muted rounded-md p-3 mb-4 text-sm text-left space-y-2">
            <div className="flex justify-between gap-2">
              <span>{selectedService?.name} x{quantity}</span>
              <span className="flex items-center"><IndianRupee className="h-3 w-3" />{totalAmount}</span>
            </div>
            <div className="border-t pt-2 flex justify-between gap-2 font-bold">
              <span>Total</span>
              <span className="flex items-center"><IndianRupee className="h-3 w-3" />{totalAmount}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => payMutation.mutate()} disabled={payMutation.isPending} data-testid="button-pay-now">
              <CreditCard className="h-4 w-4 mr-1.5" />
              {payMutation.isPending ? "Processing..." : "Pay Now"}
            </Button>
            <Link href="/services">
              <Button variant="outline" className="w-full" data-testid="button-book-another">
                Book Another Service
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen">
      <section className="bg-card dark:bg-card border-b py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book a Service</h1>
          <p className="text-muted-foreground">Choose how many times you need the service, fill in your details, and book.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!selectedService ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No service selected. Please choose a service from our services page first.</p>
                <Link href="/services">
                  <Button data-testid="button-go-services">
                    Browse Services
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </Card>
            ) : (
              <>
              <Card className="p-5" data-testid="quantity-section">
                <h2 className="font-semibold mb-3">How many times do you need this service?</h2>
                <div className="flex items-center justify-between gap-4 p-4 rounded-md bg-muted">
                  <div>
                    <p className="font-medium" data-testid="text-selected-service">{selectedService.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-0.5">
                      <IndianRupee className="h-3 w-3" />{unitPrice} per {selectedService.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      data-testid="button-qty-minus"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-bold w-8 text-center" data-testid="text-quantity">{quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setQuantity(q => q + 1)}
                      data-testid="button-qty-plus"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{quantity} x <IndianRupee className="h-3 w-3 inline" />{unitPrice}</span>
                  <span className="font-bold text-lg flex items-center" data-testid="text-total-amount">
                    Total: <IndianRupee className="h-4 w-4 ml-1" />{totalAmount}
                  </span>
                </div>
              </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-4">Your Details</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => {
                  if (!selectedServiceId) {
                    toast({ title: "No service selected", description: "Please select a service to book.", variant: "destructive" });
                    return;
                  }
                  mutation.mutate(d);
                })} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Your name" {...field} data-testid="input-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="+91 90000 00000" {...field} data-testid="input-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="customerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-booking-city">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities?.map((c) => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl><Textarea placeholder="Enter your complete address" className="min-h-[80px]" {...field} data-testid="input-address" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="scheduledDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date</FormLabel>
                        <FormControl><Input type="date" min={today} {...field} data-testid="input-date" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="scheduledTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-time">
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl><Textarea placeholder="Any special instructions..." className="min-h-[60px]" {...field} data-testid="input-notes" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full" disabled={mutation.isPending || !selectedServiceId} data-testid="button-submit-booking">
                    {mutation.isPending ? "Creating Booking..." : "Confirm Booking"}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </form>
              </Form>
            </Card>
            </>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Booking Summary</h3>
              {!selectedService ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Select a service to see your booking summary</p>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium" data-testid="summary-service-name">{selectedService.name}</p>
                    <p className="text-muted-foreground">{selectedService.unit}</p>
                  </div>
                  <div className="flex justify-between gap-2 text-muted-foreground">
                    <span>Price per unit</span>
                    <span className="flex items-center"><IndianRupee className="h-3 w-3" />{unitPrice}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-muted-foreground">
                    <span>Quantity</span>
                    <span data-testid="summary-quantity">{quantity}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between gap-2 font-bold" data-testid="summary-total">
                    <span>Total</span>
                    <span className="flex items-center"><IndianRupee className="h-3.5 w-3.5" />{totalAmount}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3 text-sm">Secure Booking</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Verified professionals only</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Secure payment via Razorpay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Free cancellation up to 24hrs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Satisfaction guaranteed</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
