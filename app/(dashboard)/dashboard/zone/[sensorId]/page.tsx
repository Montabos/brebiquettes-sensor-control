import { ZoneDetailView } from "@/components/dashboard/ZoneDetailView";

export default async function ZoneDetailPage({
  params,
}: {
  params: Promise<{ sensorId: string }>;
}) {
  const { sensorId } = await params;
  return <ZoneDetailView sensorId={decodeURIComponent(sensorId)} />;
}
