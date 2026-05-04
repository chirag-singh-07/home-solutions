import { Link } from "wouter";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { SiInstagram, SiFacebook, SiX, SiYoutube, SiLinkedin } from "react-icons/si";
import { Button } from "@/components/ui/button";

const cities = [
  "Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Berhampur",
];

export function Footer() {
  return (
    <footer className="bg-card dark:bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HS</span>
              </div>
              <span className="font-bold text-lg">HomesSolution</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Professional cleaning services in Bhubaneswar, Odisha. Quality cleaning for homes and offices.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" data-testid="link-social-instagram">
                <SiInstagram className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-social-facebook">
                <SiFacebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-social-twitter">
                <SiX className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-social-youtube">
                <SiYoutube className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-social-linkedin">
                <SiLinkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">About Us</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-services">All Services</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact Us</Link></li>
              <li><Link href="/book" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-book">Book a Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Bhubaneswar, Odisha, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+919558473889" className="hover:text-foreground transition-colors">+91 95584 73889</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@homessolution.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">We Serve In Odisha</h4>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => (
                <Badge key={city} city={city} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>2026 HomesSolution Online Services Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Badge({ city }: { city: string }) {
  return (
    <span className="inline-block text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
      {city}
    </span>
  );
}
