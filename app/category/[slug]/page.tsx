import { ShopCategory } from "@/components/shop-category";
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ShopCategory slug={slug} />;
}
