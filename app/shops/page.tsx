import { redirect } from "next/navigation";

export default function ShopsPage() {
  redirect("/properties?propertyType=SHOP");
}
