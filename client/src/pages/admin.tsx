import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LayoutDashboard, Package, ShoppingCart, Star, Settings, LogOut, Plus, Pencil, Trash2,
  IndianRupee, Users, TrendingUp, Eye, ChevronDown, Menu, X, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service, ServiceCategory, Booking, Review } from "@shared/schema";

type AdminTab = "dashboard" | "services" | "bookings" | "reviews" | "categories";

export default function Admin() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const { toast } = useToast();

  const { data: authCheck, isLoading: authLoading, isError } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  useEffect(() => {
    if (!authLoading && (isError || !authCheck?.authenticated)) {
      navigate("/admin/login");
    }
  }, [authCheck, authLoading, isError, navigate]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      navigate("/admin/login");
    } catch {
      navigate("/admin/login");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  const navItems = [
    { key: "dashboard" as AdminTab, label: "Dashboard", icon: LayoutDashboard },
    { key: "bookings" as AdminTab, label: "Bookings", icon: ShoppingCart },
    { key: "services" as AdminTab, label: "Services", icon: Package },
    { key: "categories" as AdminTab, label: "Categories", icon: Settings },
    { key: "reviews" as AdminTab, label: "Reviews", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between gap-4 px-4 h-14">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileNav(!mobileNav)} data-testid="button-admin-mobile-nav">
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">HS</span>
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-admin-logout">
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className={`${mobileNav ? "fixed inset-0 top-14 z-40 bg-background" : "hidden"} lg:block lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] w-56 border-r shrink-0 overflow-y-auto`}>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={tab === item.key ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => { setTab(item.key); setMobileNav(false); }}
                data-testid={`button-admin-nav-${item.key}`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 min-w-0">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "bookings" && <BookingsTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "reviews" && <ReviewsTab />}
        </main>
      </div>
    </div>
  );
}

function DashboardTab() {
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/admin/stats"] });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashCard title="Total Bookings" value={stats?.totalBookings || 0} icon={<ShoppingCart className="h-5 w-5" />} />
        <DashCard title="Revenue" value={`${stats?.totalRevenue || 0}`} prefix={<IndianRupee className="h-4 w-4" />} icon={<TrendingUp className="h-5 w-5" />} />
        <DashCard title="Services" value={stats?.totalServices || 0} icon={<Package className="h-5 w-5" />} />
        <DashCard title="Reviews" value={stats?.totalReviews || 0} icon={<Star className="h-5 w-5" />} />
      </div>

      <h3 className="font-semibold mb-3">Recent Bookings</h3>
      <RecentBookings bookings={stats?.recentBookings || []} />
    </div>
  );
}

function DashCard({ title, value, icon, prefix }: { title: string; value: string | number; icon: React.ReactNode; prefix?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-bold flex items-center gap-0.5">
        {prefix}{value}
      </p>
    </Card>
  );
}

function RecentBookings({ bookings }: { bookings: Booking[] }) {
  if (!bookings.length) {
    return <p className="text-sm text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <Card key={b.id} className="p-4" data-testid={`card-booking-${b.id}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{b.customerName}</p>
              <p className="text-xs text-muted-foreground">{b.city} - {b.scheduledDate} at {b.scheduledTime}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={b.status} />
              <PaymentBadge status={b.paymentStatus} />
              <span className="font-semibold text-sm flex items-center"><IndianRupee className="h-3 w-3" />{b.totalAmount}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[status] || variants.pending}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[status] || variants.unpaid}`}>
      {status}
    </span>
  );
}

function BookingsTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: bookings, isLoading } = useQuery<Booking[]>({ queryKey: ["/api/admin/bookings"] });
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/bookings/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Updated", description: "Booking status updated." });
    },
  });

  const filtered = bookings?.filter(b => statusFilter === "all" || b.status === statusFilter) || [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Bookings</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36" data-testid="select-booking-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground"><p>No bookings found.</p></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Card key={b.id} className="p-4" data-testid={`card-admin-booking-${b.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{b.customerName}</p>
                    <StatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.customerPhone} | {b.city} | {b.scheduledDate} at {b.scheduledTime}
                  </p>
                  <p className="text-xs text-muted-foreground">{b.address}</p>
                  {b.servicesJson && (() => {
                    try {
                      const items = JSON.parse(b.servicesJson) as { name: string; quantity: number; price: number }[];
                      return (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {items.map((item, i) => (
                            <p key={i}>{item.name} x{item.quantity} - <IndianRupee className="h-2.5 w-2.5 inline" />{item.price * item.quantity}</p>
                          ))}
                        </div>
                      );
                    } catch { return null; }
                  })()}
                  {b.notes && <p className="text-xs text-muted-foreground italic">Note: {b.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold flex items-center"><IndianRupee className="h-3.5 w-3.5" />{b.totalAmount}</span>
                  <Select value={b.status} onValueChange={(val) => updateMutation.mutate({ id: b.id, status: val })}>
                    <SelectTrigger className="w-32" data-testid={`select-status-${b.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const serviceFormSchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().min(2, "Slug required"),
  categoryId: z.string().min(1, "Category required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price required"),
  discountPrice: z.coerce.number().optional(),
  unit: z.string().default("per service"),
  image: z.string().optional(),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
});

function ServicesTab() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: services, isLoading } = useQuery<Service[]>({ queryKey: ["/api/admin/services"] });
  const { data: categories } = useQuery<ServiceCategory[]>({ queryKey: ["/api/categories"] });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: { name: "", slug: "", categoryId: "", shortDescription: "", description: "", price: 0, discountPrice: undefined, unit: "per service", image: "", popular: false, active: true },
  });

  const openNew = () => {
    setEditingService(null);
    form.reset({ name: "", slug: "", categoryId: "", shortDescription: "", description: "", price: 0, discountPrice: undefined, unit: "per service", image: "", popular: false, active: true });
    setDialogOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    form.reset({
      name: s.name, slug: s.slug, categoryId: s.categoryId,
      shortDescription: s.shortDescription || "", description: s.description || "",
      price: s.price, discountPrice: s.discountPrice || undefined,
      unit: s.unit, image: s.image || "", popular: s.popular, active: s.active,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceFormSchema>) => {
      if (editingService) {
        await apiRequest("PATCH", `/api/admin/services/${editingService.id}`, data);
      } else {
        await apiRequest("POST", "/api/admin/services", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDialogOpen(false);
      toast({ title: "Saved", description: `Service ${editingService ? "updated" : "created"} successfully.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save service.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Deleted", description: "Service removed." });
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Services</h2>
        <Button size="sm" onClick={openNew} data-testid="button-add-service">
          <Plus className="h-4 w-4 mr-1" /> Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {services?.map((s) => (
            <Card key={s.id} className="p-4" data-testid={`card-admin-service-${s.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {s.image && <img src={s.image} alt="" className="w-12 h-12 rounded-md object-cover shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm truncate">{s.name}</p>
                      {s.popular && <Badge className="no-default-hover-elevate no-default-active-elevate" variant="secondary">Popular</Badge>}
                      {!s.active && <Badge className="no-default-hover-elevate no-default-active-elevate" variant="destructive">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <IndianRupee className="h-3 w-3 inline" />{s.price}
                      {s.discountPrice ? ` (Offer: ${s.discountPrice})` : ""} / {s.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)} data-testid={`button-edit-service-${s.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-service-${s.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} data-testid="input-service-name" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} data-testid="input-service-slug" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-service-category"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="shortDescription" render={({ field }) => (
                <FormItem><FormLabel>Short Description</FormLabel><FormControl><Input {...field} data-testid="input-service-short-desc" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[60px]" {...field} data-testid="input-service-desc" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid sm:grid-cols-3 gap-3">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} data-testid="input-service-price" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="discountPrice" render={({ field }) => (
                  <FormItem><FormLabel>Discount Price</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ""} data-testid="input-service-discount" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem><FormLabel>Unit</FormLabel><FormControl><Input {...field} data-testid="input-service-unit" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} data-testid="input-service-image" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex items-center gap-6">
                <FormField control={form.control} name="popular" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="mt-0">Popular</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-service-popular" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="mt-0">Active</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-service-active" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending} data-testid="button-save-service">
                {saveMutation.isPending ? "Saving..." : editingService ? "Update Service" : "Create Service"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const categoryFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().min(1),
  image: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

function CategoriesTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const { data: categories, isLoading } = useQuery<ServiceCategory[]>({ queryKey: ["/api/categories"] });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", slug: "", description: "", icon: "wrench", image: "", sortOrder: 0, active: true },
  });

  const openNew = () => {
    setEditingCat(null);
    form.reset({ name: "", slug: "", description: "", icon: "wrench", image: "", sortOrder: 0, active: true });
    setDialogOpen(true);
  };

  const openEdit = (c: ServiceCategory) => {
    setEditingCat(c);
    form.reset({ name: c.name, slug: c.slug, description: c.description || "", icon: c.icon, image: c.image || "", sortOrder: c.sortOrder, active: c.active });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof categoryFormSchema>) => {
      if (editingCat) {
        await apiRequest("PATCH", `/api/admin/categories/${editingCat.id}`, data);
      } else {
        await apiRequest("POST", "/api/admin/categories", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDialogOpen(false);
      toast({ title: "Saved", description: `Category ${editingCat ? "updated" : "created"}.` });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/admin/categories/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Deleted" });
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <Button size="sm" onClick={openNew} data-testid="button-add-category">
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {categories?.map((c) => (
            <Card key={c.id} className="p-4" data-testid={`card-admin-category-${c.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-sm">{c.name}</p>
                    {!c.active && <Badge className="no-default-hover-elevate no-default-active-elevate" variant="destructive">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)} data-testid={`button-edit-cat-${c.id}`}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-cat-${c.id}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingCat ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => saveMutation.mutate(d))} className="space-y-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} data-testid="input-cat-name" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} data-testid="input-cat-slug" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} data-testid="input-cat-desc" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem><FormLabel>Icon Key</FormLabel><FormControl><Input {...field} data-testid="input-cat-icon" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="sortOrder" render={({ field }) => (
                <FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} data-testid="input-cat-order" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="mt-0">Active</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-cat-active" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={saveMutation.isPending} data-testid="button-save-category">
                {saveMutation.isPending ? "Saving..." : editingCat ? "Update" : "Create"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewsTab() {
  const { data: reviews, isLoading } = useQuery<Review[]>({ queryKey: ["/api/admin/reviews"] });
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/admin/reviews/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/recent"] });
      toast({ title: "Deleted" });
    },
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reviews</h2>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !reviews?.length ? (
        <Card className="p-8 text-center text-muted-foreground"><p>No reviews yet.</p></Card>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4" data-testid={`card-admin-review-${r.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-sm mb-1">{r.comment}</p>
                  <p className="text-xs text-muted-foreground">{r.customerName} {r.city ? `- ${r.city}` : ""}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-review-${r.id}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
