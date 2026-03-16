"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteService } from "@/app/actions/services";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteServiceButton({ serviceId, serviceName }: { serviceId: string, serviceName: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le service "${serviceName}" ?`)) return;
    setIsDeleting(true);
    await deleteService(serviceId);
    router.refresh();
    setIsDeleting(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1 text-slate-500 hover:text-red-600"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
