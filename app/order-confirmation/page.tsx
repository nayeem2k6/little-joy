import { OrderConfirmation } from "@/components/order-confirmation";

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <OrderConfirmation orderNumber={order || ""} />;
}
