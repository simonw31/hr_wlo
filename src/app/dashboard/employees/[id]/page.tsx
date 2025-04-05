// /app/dashboard/employees/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info, Briefcase, Folder } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import EmployeeProfileDisplay from "@/components/EmployeeProfileDisplay";
import DocumentsTab from "./DocumentsTab";
import ContractDisplay from "./ContractDisplay"; // Assurez-vous du bon chemin

export default async function EmployeeDetailPage(props: { params: { id: string } }) {
  const id = props.params.id;

  // Notez que nous incluons "contracts" (pluriel) désormais
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      contracts: {
        include: { availability: true },
      },
    },
  });

  if (!employee) {
    notFound();
  }

  // On sélectionne le premier contrat, ou undefined s'il n'y a aucun contrat
  const firstContract = employee.contracts && employee.contracts[0];

  // Préparer les données pour l'affichage en ajoutant la propriété "availabilities" au niveau racine
  const editEmployee = {
    ...employee,
    dateOfBirth: employee.dateOfBirth
      ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
      : "",
    // Ajout de la propriété "availabilities" basée sur le premier contrat
    availabilities: firstContract?.availability?.map((avail) => ({
      id: avail.id,
      day: String(avail.day),
      allDay: avail.allDay,
      startTime: avail.startTime ?? "",
      endTime: avail.endTime ?? "",
    })) || [],
    // Mapping du contrat pour l'onglet Contrat
    contract: firstContract
      ? {
          id: firstContract.id,
          contractType: firstContract.contractType,
          role: firstContract.role,
          hoursPerWeek: firstContract.hoursPerWeek,
          status: firstContract.status,
          resignationDate: firstContract.resignationDate
            ? new Date(firstContract.resignationDate).toISOString().split("T")[0]
            : undefined,
          // Vous pouvez conserver aussi "availability" si nécessaire
          availability: firstContract.availability?.map((avail) => ({
            id: avail.id,
            day: String(avail.day),
            allDay: avail.allDay,
            startTime: avail.startTime ?? "",
            endTime: avail.endTime ?? "",
          })) || [],
        }
      : undefined,
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="informations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="informations">
            <Info className="mr-2 h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="contrat">
            <Briefcase className="mr-2 h-4 w-4" />
            Contrat
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Folder className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="space-y-6">
          <EmployeeProfileDisplay employee={editEmployee} />
        </TabsContent>

        <TabsContent value="contrat" className="space-y-4">
          <ContractDisplay 
            employeeId={editEmployee.id} 
            contract={editEmployee.contract} 
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentsTab employeeId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
