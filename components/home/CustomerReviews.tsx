import { Star, Quote } from "lucide-react";

export default function CustomerReviews() {
  const reviews = [
    {
      name: "Engr. Bilal Ahmad",
      role: "Property Buyer (DHA Peshawar)",
      comment: "Purchasing land or houses in Peshawar was always stressful due to paperwork verification. The document audit feature here gave me absolute peace of mind before making the deposit. Splendid portal!",
      rating: 5,
      avatarText: "BA"
    },
    {
      name: "Dr. Salma Khan",
      role: "Tenant (Hayatabad Phase 6)",
      comment: "I used the site-visit booking system to schedule a tour for an apartment. The agent met me exactly on time and helped me finalize the lease agreement without extra hidden commission costs.",
      rating: 5,
      avatarText: "SK"
    },
    {
      name: "Jawad Shah",
      role: "Seller (Regi Model Town)",
      comment: "Listing my commercial file was seamless. The Cloudinary-backed uploader let me upload high-definition plot maps easily. Received multiple vetted inquiries within just four days.",
      rating: 5,
      avatarText: "JS"
    }
  ];

  return (
    <section className="py-20 bg-accent/20 border-t border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
            💬 Testimonials
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
            Read stories from individuals, families, and businesses who successfully found or sold properties through Peshawar Property Hub.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, index) => (
            <div
              key={index}
              className="relative flex flex-col bg-card border border-border rounded-2xl p-6 md:p-8 hover-lift shadow-sm"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-primary/10">
                <Quote className="h-10 w-10 fill-current" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-grow italic mb-6">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {/* User Bio */}
              <div className="flex items-center gap-3 mt-auto border-t border-border/60 pt-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {rev.avatarText}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {rev.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
