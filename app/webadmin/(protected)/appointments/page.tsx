import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, CalendarClock } from "lucide-react";

const mockAppointments = [
  { id: "1", name: "David Chen", service: "Corporate", preferredDate: "2026-03-01", status: "En attente" },
  { id: "2", name: "Emma Watson", service: "Litigation", preferredDate: "2026-02-28", status: "Confirmé" },
  { id: "3", name: "Marc Dubois", service: "Real Estate", preferredDate: "2026-02-25", status: "Terminé" },
];

export default function AppointmentsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestion des rendez-vous</h1>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date souhaitée</TableHead>
              <TableHead>Nom du client</TableHead>
              <TableHead>Service demandé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAppointments.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-slate-400" /> {apt.preferredDate}
                </TableCell>
                <TableCell>{apt.name}</TableCell>
                <TableCell>{apt.service}</TableCell>
                <TableCell>
                  <Badge 
                    variant={apt.status === "En attente" ? "default" : apt.status === "Confirmé" ? "secondary" : "outline"}
                    className={apt.status === "En attente" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : apt.status === "Confirmé" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                  >
                    {apt.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {apt.status === "En attente" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50"><CheckCircle className="h-4 w-4" /></Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50"><XCircle className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
