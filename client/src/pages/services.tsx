import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Filter, ArrowRight, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Service, ServiceCategory } from "@shared/schema";

export default function Services() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialCategory = urlParams.get("category") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const { data: categories, isLoading: catsLoading } = useQuery<ServiceCategory[]>({ queryKey: ["/api/categories"] });
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const filtered = useMemo(() => {
    if (!services) return [];
    return services.filter((s) => {
      const matchesCategory = !activeCategory || categories?.find(c => c.slug === activeCategory)?.id === s.categoryId;
      const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, activeCategory, searchTerm, categories]);

  const isLoading = catsLoading || servicesLoading;

  return (
    <div className="min-h-screen">
      <section className="bg-card dark:bg-card border-b py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">All Services</h1>
          <p className="text-muted-foreground mb-6">Browse and book from our wide range of professional home services.</p>
          <div className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("")}
            data-testid="button-filter-all"
          >
            All
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.slug ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.slug)}
              data-testid={`button-filter-${cat.slug}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No services found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} category={categories?.find(c => c.id === service.categoryId)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service, category }: { service: Service; category?: ServiceCategory }) {
  return (
    <Card className="overflow-visible group hover-elevate" data-testid={`card-service-${service.id}`}>
      <div className="relative overflow-hidden rounded-t-md">
        {service.image ? (
          <img src={service.image} alt={service.name} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-muted flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {service.popular && (
          <Badge className="absolute top-3 left-3 no-default-hover-elevate no-default-active-elevate">Popular</Badge>
        )}
      </div>
      <div className="p-4">
        {category && (
          <p className="text-xs text-muted-foreground mb-1">{category.name}</p>
        )}
        <h3 className="font-semibold mb-1">{service.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{service.description || service.shortDescription}</p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg flex items-center">
              <IndianRupee className="h-4 w-4" />
              {service.discountPrice || service.price}
            </span>
            {service.discountPrice && (
              <span className="text-sm text-muted-foreground line-through flex items-center">
                <IndianRupee className="h-3 w-3" />
                {service.price}
              </span>
            )}
            <span className="text-xs text-muted-foreground">/ {service.unit}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{service.rating}</span>
            <span className="text-muted-foreground">({service.reviewCount})</span>
          </div>
        </div>
        <Link href={`/book?service=${service.id}`}>
          <Button className="w-full mt-3" size="sm" data-testid={`button-book-${service.id}`}>
            Book Now
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
