import { Suspense } from "react";
import Hero from "@/components/home/Hero";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import LatestProperties from "@/components/home/LatestProperties";
import PopularAreas from "@/components/home/PopularAreas";
import StatsSection from "@/components/home/StatsSection";
import PropertyCategories from "@/components/home/PropertyCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CustomerReviews from "@/components/home/CustomerReviews";
import ContactCTA from "@/components/home/ContactCTA";
import {
  FeaturedPropertiesSkeleton,
  LatestPropertiesSkeleton,
  StatsSkeleton,
  PopularAreasSkeleton,
} from "@/components/home/HomeSkeletons";

// Revalidate homepage data every 5 minutes (ISR)
export const revalidate = 300;

export default function HomePage() {
  const pageStart = Date.now();
  if (process.env.NODE_ENV === "development") {
    console.log(`[Perf Audit] HomePage rendering started at ${pageStart}`);
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Section & Search Filters */}
      <Hero />

      {/* 2. Live Platform Statistics */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* 3. Featured Properties — Top 3 most viewed real listings */}
      <Suspense fallback={<FeaturedPropertiesSkeleton />}>
        <FeaturedProperties />
      </Suspense>

      {/* 4. Latest Property Listings — 4 most recently added real listings */}
      <Suspense fallback={<LatestPropertiesSkeleton />}>
        <LatestProperties />
      </Suspense>

      {/* 5. Popular Areas — Calculated dynamically from real DB data */}
      <Suspense fallback={<PopularAreasSkeleton />}>
        <PopularAreas />
      </Suspense>

      {/* 6. Property Categories */}
      <PropertyCategories />

      {/* 7. Platform Standards & Why Choose Us */}
      <WhyChooseUs />

      {/* 8. Customer Testimonials & Reviews */}
      <CustomerReviews />

      {/* 9. Call To Action Banner */}
      <ContactCTA />
    </div>
  );
}
