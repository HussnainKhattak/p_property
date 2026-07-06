import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import EditPropertyForm from "@/components/property/EditPropertyForm";
import { isValidObjectId } from "@/lib/utils";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id: propertyId } = await params;
  const session = await auth();

  if (!session?.user) redirect("/login");

  // Validate MongoDB ObjectId before hitting DB
  if (!isValidObjectId(propertyId)) redirect("/dashboard");

  const property = await db.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) redirect("/dashboard");

  // Authorize: Only the owner can edit their own listing
  if (property.ownerId !== session.user.id) redirect("/dashboard");

  const serializedProperty = {
    id:           property.id,
    title:        property.title,
    description:  property.description,
    price:        property.price,
    marla:        property.marla,
    city:         property.city,
    area:         property.area,
    address:      property.address,
    propertyType: property.propertyType,
    listingType:  property.listingType,
    bedrooms:     property.bedrooms,
    bathrooms:    property.bathrooms,
    imageUrls:    property.imageUrls,   // MongoDB array
    videoUrl:     property.videoUrl,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col gap-2 mb-10 text-left">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Edit Property Listing
        </h1>
        <p className="text-muted-foreground text-sm">
          Update the fields below to modify your Peshawar Property Hub listing.
        </p>
      </div>

      <EditPropertyForm property={serializedProperty} />
    </div>
  );
}
