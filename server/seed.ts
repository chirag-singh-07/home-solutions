import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, serviceCategories, services, cities, reviews } from "@shared/schema";

export async function seedDatabase() {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length === 0) {
    await storage.createUser({
      username: "bichitra",
      password: "Bichitra9558@",
      name: "Admin User",
      email: "admin@homessolution.com",
      phone: "+919558473889",
      role: "admin",
      city: "Bhubaneswar",
    });
  } else {
    await db.update(users).set({
      username: "bichitra",
      password: "Bichitra9558@",
    }).where(eq(users.role, "admin"));
  }

  const existingCats = await db.select().from(serviceCategories).limit(1);
  if (existingCats.length > 0) {
    const hasOldData = existingCats.some(c => 
      ["salon-spa", "plumbing", "electrical", "pest-control", "movers-packers", "renovation", "painting", "appliance-repair"].includes(c.slug)
    );
    if (!hasOldData) return;
    await db.delete(reviews);
    await db.delete(services);
    await db.delete(serviceCategories);
    await db.delete(cities);
    console.log("Cleared old demo data, re-seeding with cleaning services...");
  }

  const catData = [
    { name: "Bathroom Cleaning", slug: "bathroom-cleaning", description: "Professional bathroom deep cleaning services - Classic, Intense & Move-in options", icon: "sparkles", sortOrder: 1, active: true },
    { name: "Kitchen Cleaning", slug: "kitchen-cleaning", description: "Thorough kitchen cleaning including cabinets, countertops and appliances", icon: "sparkles", sortOrder: 2, active: true },
    { name: "Chimney Cleaning", slug: "chimney-cleaning", description: "Kitchen chimney cleaning - Basic and Deep cleaning options", icon: "wrench", sortOrder: 3, active: true },
    { name: "Sofa & Cushion Cleaning", slug: "sofa-cushion-cleaning", description: "Professional sofa and cushion cleaning for all sizes", icon: "sparkles", sortOrder: 4, active: true },
    { name: "Home Cleaning (by Sq Ft)", slug: "office-cleaning", description: "Professional home cleaning services based on home size in square feet", icon: "sparkles", sortOrder: 5, active: true },
    { name: "Carpet Cleaning", slug: "carpet-cleaning", description: "Deep carpet cleaning for homes and offices", icon: "sparkles", sortOrder: 6, active: true },
    { name: "Water Tank Cleaning", slug: "water-tank-cleaning", description: "Hygienic water tank cleaning and sanitization", icon: "wrench", sortOrder: 7, active: true },
    { name: "Home Cleaning", slug: "home-cleaning", description: "Complete home deep cleaning - with and without furniture options", icon: "sparkles", sortOrder: 8, active: true },
    { name: "Balcony Cleaning", slug: "balcony-cleaning", description: "Thorough balcony cleaning and washing service", icon: "sparkles", sortOrder: 9, active: true },
  ];

  const createdCats: any[] = [];
  for (const cat of catData) {
    const c = await storage.createCategory(cat);
    createdCats.push(c);
  }

  const svcData = [
    { categorySlug: "bathroom-cleaning", name: "Bathroom Classic Clean", slug: "bathroom-classic", shortDescription: "Standard bathroom cleaning with scrubbing and sanitization", description: "Complete bathroom cleaning including tiles, floor, basin, mirror, and fittings. Standard cleaning for regular maintenance.", price: 500, unit: "per bathroom", image: "/images/bathroom-classic.png", popular: true, rating: "4.7", reviewCount: 85 },
    { categorySlug: "bathroom-cleaning", name: "Bathroom Intense Clean", slug: "bathroom-intense", shortDescription: "Deep intensive bathroom cleaning with stain removal", description: "Intensive deep cleaning covering hard water stain removal, grout cleaning, heavy scrubbing and complete sanitization.", price: 600, unit: "per bathroom", image: "/images/bathroom-intense.png", popular: true, rating: "4.8", reviewCount: 62 },
    { categorySlug: "bathroom-cleaning", name: "Bathroom Move-in Clean", slug: "bathroom-movein", shortDescription: "Complete bathroom restoration cleaning for new move-ins", description: "Thorough move-in ready bathroom cleaning. Deep scrub, descaling, disinfection and polishing for a brand new feel.", price: 700, unit: "per bathroom", image: "/images/bathroom-movein.png", popular: false, rating: "4.9", reviewCount: 34 },

    { categorySlug: "kitchen-cleaning", name: "Kitchen Deep Cleaning", slug: "kitchen-deep-clean", shortDescription: "Complete kitchen deep cleaning including all surfaces", description: "Full kitchen deep cleaning covering countertops, cabinets, sink, stove, tiles, chimney exterior, and floor. Oil and grease removal included.", price: 1700, unit: "per kitchen", image: "/images/kitchen-deep.png", popular: true, rating: "4.8", reviewCount: 93 },

    { categorySlug: "chimney-cleaning", name: "Chimney Basic Cleaning", slug: "chimney-basic", shortDescription: "Basic chimney filter and surface cleaning", description: "Basic chimney cleaning including filter cleaning, outer surface wipe down and basic grease removal.", price: 550, unit: "per chimney", image: "/images/chimney-basic.png", popular: true, rating: "4.6", reviewCount: 47 },
    { categorySlug: "chimney-cleaning", name: "Chimney Deep Cleaning", slug: "chimney-deep", shortDescription: "Complete chimney deep cleaning with dismantling", description: "Deep chimney cleaning with filter dismantling, motor cleaning, heavy grease and oil removal, and full reassembly.", price: 1200, unit: "per chimney", image: "/images/chimney-deep.png", popular: false, rating: "4.8", reviewCount: 29 },

    { categorySlug: "sofa-cushion-cleaning", name: "Sofa Cleaning - 5 Seater", slug: "sofa-5-seater", shortDescription: "Professional dry/wet cleaning for 5 seater sofa", description: "Complete sofa cleaning for 5 seater using professional equipment. Stain removal, deodorizing and sanitization included.", price: 900, unit: "per sofa", image: "/images/sofa-5seater.png", popular: true, rating: "4.7", reviewCount: 76 },
    { categorySlug: "sofa-cushion-cleaning", name: "Sofa Cleaning - 6 Seater", slug: "sofa-6-seater", shortDescription: "Professional dry/wet cleaning for 6 seater sofa", description: "Complete sofa cleaning for 6 seater using professional equipment. Stain removal, deodorizing and sanitization included.", price: 1000, unit: "per sofa", image: "/images/sofa-6seater.png", popular: false, rating: "4.7", reviewCount: 54 },
    { categorySlug: "sofa-cushion-cleaning", name: "Sofa Cleaning - 7 Seater", slug: "sofa-7-seater", shortDescription: "Professional dry/wet cleaning for 7 seater sofa", description: "Complete sofa cleaning for 7 seater using professional equipment. Stain removal, deodorizing and sanitization included.", price: 1100, unit: "per sofa", image: "/images/sofa-7seater.png", popular: false, rating: "4.6", reviewCount: 41 },
    { categorySlug: "sofa-cushion-cleaning", name: "Sofa Cleaning - 8 Seater", slug: "sofa-8-seater", shortDescription: "Professional dry/wet cleaning for 8 seater sofa", description: "Complete sofa cleaning for 8 seater using professional equipment. Stain removal, deodorizing and sanitization included.", price: 1200, unit: "per sofa", image: "/images/sofa-8seater.png", popular: false, rating: "4.6", reviewCount: 33 },
    { categorySlug: "sofa-cushion-cleaning", name: "Sofa Cleaning - 9 Seater", slug: "sofa-9-seater", shortDescription: "Professional dry/wet cleaning for 9 seater sofa", description: "Complete sofa cleaning for 9 seater using professional equipment. Stain removal, deodorizing and sanitization included.", price: 1300, unit: "per sofa", image: "/images/sofa-9seater.png", popular: false, rating: "4.7", reviewCount: 22 },
    { categorySlug: "sofa-cushion-cleaning", name: "Sofa Cleaning - 10 Seater", slug: "sofa-10-seater", shortDescription: "Professional dry/wet cleaning for 10 seater sofa", description: "Complete sofa cleaning for 10 seater using professional equipment. Stain removal, deodorizing and sanitization included.", price: 1400, unit: "per sofa", image: "/images/sofa-10seater.png", popular: false, rating: "4.7", reviewCount: 18 },
    { categorySlug: "sofa-cushion-cleaning", name: "Cushion Set Cleaning - 5 Pcs", slug: "cushion-5-set", shortDescription: "Professional cleaning for set of 5 cushions", description: "Deep cleaning for a set of 5 cushions. Dust removal, stain treatment, deodorizing and drying included.", price: 160, unit: "per set of 5", image: "/images/cushion-set.png", popular: false, rating: "4.5", reviewCount: 28 },

    { categorySlug: "office-cleaning", name: "Home Cleaning - Up to 250 sq ft", slug: "home-sqft-250", shortDescription: "Professional cleaning for homes up to 250 sq ft", description: "Complete home cleaning for spaces up to 250 sq ft. Floor mopping, dusting, kitchen and bathroom cleaning, and sanitization.", price: 2500, unit: "per home", image: "/images/home-250sqft.png", popular: true, rating: "4.7", reviewCount: 39 },
    { categorySlug: "office-cleaning", name: "Home Cleaning - 250 to 500 sq ft", slug: "home-sqft-500", shortDescription: "Professional cleaning for homes 250-500 sq ft", description: "Complete home cleaning for spaces between 250-500 sq ft. Floor mopping, dusting, kitchen and bathroom cleaning, and sanitization.", price: 3000, unit: "per home", image: "/images/home-500sqft.png", popular: false, rating: "4.6", reviewCount: 27 },
    { categorySlug: "office-cleaning", name: "Home Cleaning - 500 to 1000 sq ft", slug: "home-sqft-1000", shortDescription: "Professional cleaning for homes 500-1000 sq ft", description: "Complete home cleaning for spaces between 500-1000 sq ft. Floor mopping, dusting, kitchen and bathroom cleaning, and sanitization.", price: 4500, unit: "per home", image: "/images/home-1000sqft.png", popular: false, rating: "4.7", reviewCount: 21 },
    { categorySlug: "office-cleaning", name: "Home Cleaning - 1000 to 1500 sq ft", slug: "home-sqft-1500", shortDescription: "Professional cleaning for homes 1000-1500 sq ft", description: "Complete home cleaning for spaces between 1000-1500 sq ft. Floor mopping, dusting, kitchen and bathroom cleaning, and sanitization.", price: 6000, unit: "per home", image: "/images/home-1500sqft.png", popular: false, rating: "4.8", reviewCount: 15 },
    { categorySlug: "office-cleaning", name: "Home Cleaning - 1500 to 2000 sq ft", slug: "home-sqft-2000", shortDescription: "Professional cleaning for homes 1500-2000 sq ft", description: "Complete home cleaning for spaces between 1500-2000 sq ft. Floor mopping, dusting, kitchen and bathroom cleaning, and sanitization.", price: 8000, unit: "per home", image: "/images/home-2000sqft.png", popular: false, rating: "4.7", reviewCount: 11 },
    { categorySlug: "office-cleaning", name: "Home Cleaning - 2000 to 2500 sq ft", slug: "home-sqft-2500", shortDescription: "Professional cleaning for homes 2000-2500 sq ft", description: "Complete home cleaning for spaces between 2000-2500 sq ft. Floor mopping, dusting, kitchen and bathroom cleaning, and sanitization.", price: 11000, unit: "per home", image: "/images/home-2500sqft.png", popular: false, rating: "4.8", reviewCount: 8 },

    { categorySlug: "carpet-cleaning", name: "Carpet Cleaning - Small (4x6 / 25 sq ft)", slug: "carpet-small", shortDescription: "Deep cleaning for small carpets up to 25 sq ft", description: "Professional carpet cleaning for small carpets (4x6 ft or up to 25 sq ft). Deep vacuuming, stain removal and drying.", price: 500, unit: "per carpet", image: "/images/carpet-small.png", popular: true, rating: "4.6", reviewCount: 44 },
    { categorySlug: "carpet-cleaning", name: "Carpet Cleaning - Medium (6x8 / 50 sq ft)", slug: "carpet-medium", shortDescription: "Deep cleaning for medium carpets up to 50 sq ft", description: "Professional carpet cleaning for medium carpets (6x8 ft or up to 50 sq ft). Deep vacuuming, stain removal and drying.", price: 900, unit: "per carpet", image: "/images/carpet-medium.png", popular: false, rating: "4.7", reviewCount: 31 },
    { categorySlug: "carpet-cleaning", name: "Carpet Cleaning - Custom Size", slug: "carpet-custom", shortDescription: "Deep cleaning for large or custom-sized carpets", description: "Professional carpet cleaning for large or custom-sized carpets. Price based on actual carpet size. Contact us for a quote.", price: 900, unit: "price varies", image: "/images/carpet-custom.png", popular: false, rating: "4.7", reviewCount: 19 },

    { categorySlug: "water-tank-cleaning", name: "Water Tank Cleaning", slug: "water-tank", shortDescription: "Complete water tank cleaning and sanitization", description: "Professional water tank cleaning with draining, scrubbing, anti-bacterial treatment and sanitization. Price based on tank size - contact us for a quote.", price: 500, unit: "price on request", image: "/images/water-tank.png", popular: true, rating: "4.8", reviewCount: 52 },

    { categorySlug: "home-cleaning", name: "Home Cleaning 1BHK - With Furniture", slug: "home-1bhk-furniture", shortDescription: "Complete 1BHK home cleaning including furniture", description: "Full 1BHK home deep cleaning with furniture cleaning. Covers all rooms, kitchen, bathroom, balcony. Includes sofa, bed, and furniture surface cleaning.", price: 3600, unit: "per home", image: "/images/home-1bhk-furn.png", popular: true, rating: "4.8", reviewCount: 112 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 1BHK - Without Furniture", slug: "home-1bhk-no-furniture", shortDescription: "Complete 1BHK home cleaning without furniture", description: "Full 1BHK home deep cleaning without furniture. Covers all rooms, kitchen, bathroom, balcony. Floor, walls, windows, and fixtures cleaning.", price: 3100, unit: "per home", image: "/images/home-1bhk-nofurn.png", popular: false, rating: "4.7", reviewCount: 89 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 2BHK - With Furniture", slug: "home-2bhk-furniture", shortDescription: "Complete 2BHK home cleaning including furniture", description: "Full 2BHK home deep cleaning with furniture cleaning. Covers all rooms, kitchen, bathrooms, balcony.", price: 5000, unit: "per home", image: "/images/home-2bhk-furn.png", popular: true, rating: "4.8", reviewCount: 97 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 2BHK - Without Furniture", slug: "home-2bhk-no-furniture", shortDescription: "Complete 2BHK home cleaning without furniture", description: "Full 2BHK home deep cleaning without furniture. Covers all rooms, kitchen, bathrooms, balcony.", price: 4500, unit: "per home", image: "/images/home-2bhk-nofurn.png", popular: false, rating: "4.7", reviewCount: 74 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 3BHK - With Furniture", slug: "home-3bhk-furniture", shortDescription: "Complete 3BHK home cleaning including furniture", description: "Full 3BHK home deep cleaning with furniture cleaning. Covers all rooms, kitchen, bathrooms, balconies.", price: 7000, unit: "per home", image: "/images/home-3bhk-furn.png", popular: true, rating: "4.9", reviewCount: 68 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 3BHK - Without Furniture", slug: "home-3bhk-no-furniture", shortDescription: "Complete 3BHK home cleaning without furniture", description: "Full 3BHK home deep cleaning without furniture. Covers all rooms, kitchen, bathrooms, balconies.", price: 6500, unit: "per home", image: "/images/home-3bhk-nofurn.png", popular: false, rating: "4.7", reviewCount: 55 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 4BHK - With Furniture", slug: "home-4bhk-furniture", shortDescription: "Complete 4BHK home cleaning including furniture", description: "Full 4BHK home deep cleaning with furniture cleaning. Covers all rooms, kitchen, bathrooms, balconies.", price: 8000, unit: "per home", image: "/images/home-4bhk-furn.png", popular: false, rating: "4.8", reviewCount: 42 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 4BHK - Without Furniture", slug: "home-4bhk-no-furniture", shortDescription: "Complete 4BHK home cleaning without furniture", description: "Full 4BHK home deep cleaning without furniture. Covers all rooms, kitchen, bathrooms, balconies.", price: 7000, unit: "per home", image: "/images/home-4bhk-nofurn.png", popular: false, rating: "4.7", reviewCount: 36 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 5BHK - With Furniture", slug: "home-5bhk-furniture", shortDescription: "Complete 5BHK home cleaning including furniture", description: "Full 5BHK home deep cleaning with furniture cleaning. Covers all rooms, kitchen, bathrooms, balconies.", price: 8500, unit: "per home", image: "/images/home-5bhk-furn.png", popular: false, rating: "4.8", reviewCount: 24 },
    { categorySlug: "home-cleaning", name: "Home Cleaning 5BHK - Without Furniture", slug: "home-5bhk-no-furniture", shortDescription: "Complete 5BHK home cleaning without furniture", description: "Full 5BHK home deep cleaning without furniture. Covers all rooms, kitchen, bathrooms, balconies.", price: 7500, unit: "per home", image: "/images/home-5bhk-nofurn.png", popular: false, rating: "4.7", reviewCount: 19 },

    { categorySlug: "balcony-cleaning", name: "Balcony Cleaning", slug: "balcony-clean", shortDescription: "Complete balcony cleaning and washing", description: "Thorough balcony cleaning including floor scrubbing, railing cleaning, wall wiping, cobweb removal and washing.", price: 550, unit: "per balcony", image: "/images/balcony-clean.png", popular: true, rating: "4.6", reviewCount: 58 },
  ];

  for (const svc of svcData) {
    const cat = createdCats.find((c) => c.slug === svc.categorySlug);
    if (cat) {
      const { categorySlug, ...rest } = svc;
      await storage.createService({ ...rest, categoryId: cat.id, active: true, features: null, discountPrice: null });
    }
  }

  await storage.createCity({ name: "Bhubaneswar", slug: "bhubaneswar", active: true });
  await storage.createCity({ name: "Cuttack", slug: "cuttack", active: true });
  await storage.createCity({ name: "Puri", slug: "puri", active: true });
  await storage.createCity({ name: "Rourkela", slug: "rourkela", active: true });
  await storage.createCity({ name: "Berhampur", slug: "berhampur", active: true });

  const reviewData = [
    { customerName: "Snehalata Panda", rating: 5, comment: "Excellent bathroom cleaning service! They were thorough and the bathroom looks brand new. Very professional team.", city: "Bhubaneswar", serviceId: "" },
    { customerName: "Rajesh Mohapatra", rating: 5, comment: "Got my 3BHK deep cleaned before Diwali. Amazing work, every corner was spotless. Highly recommend HomesSolution!", city: "Bhubaneswar", serviceId: "" },
    { customerName: "Priyanka Das", rating: 4, comment: "Sofa cleaning was great. They removed old stains that I thought were permanent. Will definitely book again.", city: "Bhubaneswar", serviceId: "" },
    { customerName: "Sanjay Nayak", rating: 5, comment: "Office cleaning was perfect. The team was punctual, polite and did excellent work. Our office looks amazing now.", city: "Bhubaneswar", serviceId: "" },
    { customerName: "Mamata Behera", rating: 5, comment: "Kitchen deep cleaning was superb! Chimney, gas stove, tiles - everything is sparkling clean. Great value for money.", city: "Bhubaneswar", serviceId: "" },
    { customerName: "Ashok Mishra", rating: 4, comment: "Water tank cleaning was done very professionally. They sanitized the tank properly. Good service at reasonable price.", city: "Cuttack", serviceId: "" },
  ];

  for (const rev of reviewData) {
    await storage.createReview(rev);
  }

  console.log("Database seeded successfully with Bhubaneswar services");
}
