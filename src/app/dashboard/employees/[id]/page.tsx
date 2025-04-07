export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EmployeeProfileDisplay from "@/components/EmployeeProfileDisplay";
import ContractDisplay from "./ContractDisplay";
import DocumentsTab from "./DocumentsTab";
import { Info, Briefcase, Folder } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Nous recevons les props en tant qu'objet synchronisé,
// puis nous forçons leur typage pour satisfaire la contrainte PageProps.
export default async function EmployeeDetailPage(
  rawProps: { params: { id: string } }
) {
  // Forcer rawProps en un type conforme à PageProps (où params est thenable)
  const props = rawProps as unknown as { params: Promise<{ id: string }> };

  // Attendre la résolution de params
  const { id } = await props.params;

  // Récupérer l'employé avec ses contrats
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

  // Sélectionner le premier contrat, ou undefined s'il n'y a aucun contrat
  const firstContract = employee.contracts?.[0];

  // Préparer les données pour l'affichage en ajoutant la propriété "availabilities"
  const editEmployee = {
    ...employee,
    dateOfBirth: employee.dateOfBirth
      ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
      : "",
    availabilities:
      firstContract?.availability?.map((avail: {
        id: string;
        day: string;
        allDay: boolean;
        startTime: string | null;
        endTime: string | null;
      }) => ({
        id: avail.id,
        day: String(avail.day),
        allDay: avail.allDay,
        startTime: avail.startTime ?? "",
        endTime: avail.endTime ?? "",
      })) || [],
    contract: firstContract
      ? {
          id: firstContract.id,
          contractType: firstContract.contractType,
          role: firstContract.role,
          hoursPerWeek: firstContract.hoursPerWeek,
          status: firstContract.status,
          resignationDate: firstContract.resignationDate
            ? new Date(firstContract.resignationDate)
                .toISOString()
                .split("T")[0]
            : undefined,
          availability:
            firstContract.availability?.map((avail: {
              id: string;
              day: string;
              allDay: boolean;
              startTime: string | null;
              endTime: string | null;
            }) => ({
              id: avail.id,
              day: String(avail.day),
              allDay: avail.allDay,
              startTime: avail.startTime ?? "",
              endTime: avail.endTime ?? "",
            })) || [],
        }
      : undefined,
  };

  // On fait une assertion de type pour DocumentsTab pour préciser que employeeId est une string.
  const DocumentsTabWithProps = DocumentsTab as React.FC<{ employeeId: string }>;

  return (
    <div className="p-6">
      {/* Votre affichage avec Tabs */}
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
          <DocumentsTabWithProps employeeId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
