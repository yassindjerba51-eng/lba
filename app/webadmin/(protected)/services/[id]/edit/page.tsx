import { notFound } from "next/navigation";
import { getServiceById } from "@/app/actions/services";
import ServiceForm from "../../ServiceForm";

export default async function EditServiceAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return <ServiceForm initialData={service} serviceId={service.id} />;
}
