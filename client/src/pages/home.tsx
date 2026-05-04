import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckCircle2, Shield, Clock, HeadphonesIcon, Star, ArrowRight, Sparkles, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceCategory, City, Review } from "@shared/schema";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("");
  const { data: categories, isLoading: catsLoading } = useQuery<ServiceCategory[]>({ queryKey: ["/api/categories"] });
  const { data: cities } = useQuery<City[]>({ queryKey: ["/api/cities"] });
  const { data: reviews } = useQuery<Review[]>({ queryKey: ["/api/reviews/recent"] });

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Professional Cleaning Services in Bhubaneswar
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed">
              Professional cleaning services in Bhubaneswar, Odisha. Home, office, kitchen, bathroom and more - we have got you covered.
            </p>
            <div className="bg-white/10 backdrop-blur-lg rounded-md p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-white/90 dark:bg-white/90 text-foreground border-0 sm:w-48" data-testid="select-city">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.slug} data-testid={`city-option-${city.slug}`}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="What service do you need?"
                    className="bg-white/90 dark:bg-white/90 text-foreground border-0 flex-1"
                    data-testid="input-search-service"
                  />
                  <Link href="/services">
                    <Button data-testid="button-search-services">
                      <Search className="h-4 w-4 mr-1.5" />
                      Search
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <StatBadge icon={<Users className="h-4 w-4" />} label="Happy Customers" value="400+" />
              <StatBadge icon={<CheckCircle2 className="h-4 w-4" />} label="Projects Done" value="500+" />
              <StatBadge icon={<Star className="h-4 w-4" />} label="Avg Rating" value="4.8" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Our Service Categories</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse through our cleaning services in Bhubaneswar. Professional experts ready to help you.
            </p>
          </div>
          {catsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories?.map((cat) => (
                <Link key={cat.id} href={`/services?category=${cat.slug}`} data-testid={`card-category-${cat.slug}`}>
                  <Card className="overflow-visible hover-elevate cursor-pointer group h-full">
                    <div className="aspect-[4/3] overflow-hidden rounded-t-md">
                      <img
                        src={getCategoryImage(cat.slug)}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" data-testid="button-view-all-services">
                View All Services
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why Choose HomesSolution?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Bhubaneswar's trusted cleaning service provider. Quality, reliability and affordability guaranteed.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="h-7 w-7" />}
              title="Trained Professionals"
              description="Our cleaning team is trained with professional-grade equipment for spotless results every time."
            />
            <FeatureCard
              icon={<Sparkles className="h-7 w-7" />}
              title="Affordable Prices"
              description="Transparent pricing with no hidden charges. Get the best cleaning services at competitive rates."
            />
            <FeatureCard
              icon={<HeadphonesIcon className="h-7 w-7" />}
              title="Local & Reliable"
              description="Based in Bhubaneswar, we understand local needs. On-time service with full customer support."
            />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Trusted by happy customers across Bhubaneswar and Odisha.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews?.slice(0, 6).map((review) => (
              <Card key={review.id} className="p-5" data-testid={`card-review-${review.id}`}>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{review.comment}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.customerName}</p>
                    {review.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {review.city}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="mb-6 opacity-90 max-w-lg mx-auto">
            Book a cleaning service today in Bhubaneswar and experience professional cleaning at your doorstep.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/book">
              <Button variant="secondary" size="lg" data-testid="button-cta-book">
                Book a Service
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/30 text-primary-foreground backdrop-blur-sm" data-testid="button-cta-explore">
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-md px-3 py-2 border border-white/10">
      <span className="text-white/80">{icon}</span>
      <div>
        <p className="text-white font-bold text-sm">{value}</p>
        <p className="text-white/60 text-xs">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-6 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

function getCategoryImage(slug: string) {
  const imageMap: Record<string, string> = {
    "bathroom-cleaning": "/images/service-bathroom.png",
    "kitchen-cleaning": "/images/service-kitchen.png",
    "chimney-cleaning": "/images/service-chimney.png",
    "sofa-cushion-cleaning": "/images/service-sofa.png",
    "office-cleaning": "/images/service-office.png",
    "carpet-cleaning": "/images/service-carpet.png",
    "water-tank-cleaning": "/images/water-tank.png",
    "home-cleaning": "/images/service-home.png",
    "balcony-cleaning": "/images/service-balcony.png",
  };
  return imageMap[slug] || "/images/service-cleaning.png";
}
