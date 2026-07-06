import Hero from "@/components/home/Hero";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import LatestProperties from "@/components/home/LatestProperties";
import PopularAreas from "@/components/home/PopularAreas";
import PropertyCategories from "@/components/home/PropertyCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CustomerReviews from "@/components/home/CustomerReviews";
import ContactCTA from "@/components/home/ContactCTA";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Section & Search Filters */}
      <Hero />

      {/* 2. Featured Properties (Certified & Inspected Deals) */}
      <FeaturedProperties />

      {/* 3. Latest Property Listings (Recently Added) */}
      <LatestProperties />

      {/* 4. Popular Areas & Neighborhood Finder */}
      <PopularAreas />

      {/* 5. Property Categories (Houses, Apartments, Commercial plots, Offices) */}
      <PropertyCategories />

      {/* 6. Platform Standard & Why Choose Us */}
      <WhyChooseUs />

      {/* 7. Customer Testimonials & Reviews */}
      <CustomerReviews />

      {/* 8. Call To Action Banner */}
      <ContactCTA />
    </div>
  );
}
