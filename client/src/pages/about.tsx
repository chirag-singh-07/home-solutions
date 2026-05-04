import { Shield, Users, Target, Award, CheckCircle2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen">
      <section className="bg-card dark:bg-card border-b py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">About HomesSolution</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            We are Bhubaneswar's trusted professional cleaning service provider. From homes to offices, we deliver spotless results every time.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value="500+" label="Completed Projects" icon={<CheckCircle2 className="h-6 w-6" />} />
            <StatCard value="400+" label="Happy Customers" icon={<Users className="h-6 w-6" />} />
            <StatCard value="5+" label="Cities in Odisha" icon={<MapPin className="h-6 w-6" />} />
            <StatCard value="30+" label="Trained Cleaners" icon={<Shield className="h-6 w-6" />} />
          </div>
        </div>
      </section>

      <section className="py-16 bg-card dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                HomesSolution was founded in Bhubaneswar with the vision of providing top-quality cleaning services to homes and offices across Odisha. We take pride in our trained cleaning professionals and use professional-grade equipment for every job.
              </p>
              <ul className="space-y-3">
                {[
                  "Trained and experienced cleaning professionals",
                  "Transparent pricing with no hidden charges",
                  "Dedicated customer support team",
                  "Satisfaction guaranteed on every service",
                  "Serving Bhubaneswar and nearby cities in Odisha",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 text-center">
                <Target className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Our Vision</h3>
                <p className="text-xs text-muted-foreground">To be the most trusted cleaning service in Odisha.</p>
              </Card>
              <Card className="p-5 text-center">
                <Award className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Quality First</h3>
                <p className="text-xs text-muted-foreground">Every cleaner is trained with professional equipment.</p>
              </Card>
              <Card className="p-5 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Customer Focus</h3>
                <p className="text-xs text-muted-foreground">Your satisfaction is our top priority.</p>
              </Card>
              <Card className="p-5 text-center">
                <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Trust & Safety</h3>
                <p className="text-xs text-muted-foreground">Background verified and insured professionals.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <Card className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
