import { Suspense } from "react";
import Hero from "@/components/home/Hero";
import PopularAreas from "@/components/home/PopularAreas";
import PropertyCategories from "@/components/home/PropertyCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CustomerReviews from "@/components/home/CustomerReviews";
import ContactCTA from "@/components/home/ContactCTA";
import {
  PopularAreasSkeleton,
} from "@/components/home/HomeSkeletons";

// Revalidate homepage data every 5 minutes (ISR)
export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Section & Search Filters */}
      <Hero />

      {/* 2. Property Categories */}
      <PropertyCategories />

      {/* 4. Popular Areas — Calculated dynamically from real DB data */}
      <Suspense fallback={<PopularAreasSkeleton />}>
        <PopularAreas />
      </Suspense>

      {/* 5. Platform Standards & Why Choose Us */}
      <WhyChooseUs />

      {/* 6. Customer Testimonials & Reviews */}
      <CustomerReviews />

      {/* 7. Call To Action Banner */}
      <ContactCTA />
    </div>
  );
}
