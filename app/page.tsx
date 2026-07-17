import Hero from "@/components/home/Hero";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import LatestProperties from "@/components/home/LatestProperties";
import PopularAreas from "@/components/home/PopularAreas";
import StatsSection from "@/components/home/StatsSection";
import PropertyCategories from "@/components/home/PropertyCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CustomerReviews from "@/components/home/CustomerReviews";
import ContactCTA from "@/components/home/ContactCTA";

// Force dynamic rendering — always fetch fresh data on every request.
// This ensures newly created properties appear on the homepage immediately
// without waiting for ISR cache to expire.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Section & Search Filters */}
      <Hero />

      {/* 2. Live Platform Statistics */}
      <StatsSection />

      {/* 3. Featured Properties — Top 3 most viewed real listings */}
      <FeaturedProperties />

      {/* 4. Latest Property Listings — 6 most recently added real listings */}
      <LatestProperties />

      {/* 5. Popular Areas — Calculated dynamically from real DB data */}
      <PopularAreas />

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
