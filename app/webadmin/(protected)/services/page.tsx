import Link from "next/link";
import { getAllServices } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Eye, Trash2, Globe } from "lucide-react";
import DeleteServiceButton from "./DeleteServiceButton";

export default async function ServicesAdminPage() {
  const services = await getAllServices();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestion du contenu : Services</h1>
        <Link href="/webadmin/services/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Ajouter un service</Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nom du service (Interne)</TableHead>
              <TableHead>Slug URL</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                  Aucun service trouvé
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => {
                const nameFr = (service.name as any)?.fr || "—";
                const nameEn = (service.name as any)?.en || "";
                const nameAr = (service.name as any)?.ar || "";
                const hasAllTranslations = !!nameFr && !!nameEn && !!nameAr;
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{nameFr}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-sm">/services/{service.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className={`h-4 w-4 ${hasAllTranslations ? 'text-primary' : 'text-slate-300'}`} />
                        <span className="text-xs">{hasAllTranslations ? 'FR, EN, AR disponibles' : 'Traductions manquantes'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/fr/services/${service.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-primary">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/webadmin/services/${service.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-blue-600">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <DeleteServiceButton serviceId={service.id} serviceName={nameFr} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
