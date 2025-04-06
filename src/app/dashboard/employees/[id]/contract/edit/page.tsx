// /app/dashboard/employees/[id]/contract/edit/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
// Suppression de l'import de notFound puisqu'il n'est pas utilisé
import ContractEditForm from "./ContractEditForm";

// Définition explicite du contexte de page
interface PageContext {
  params: {
    id: string;
  };
}

interface PrismaAvailability {
  id: string;
  day: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface PrismaContract {
  id: string;
  contractType: string | null;
  role: string;
  hoursPerWeek: number | null;
  status: string;
  resignationDate: Date | null;
  endDate: Date | null;
  availability: PrismaAvailability[];
}

// On définit un type local pour correspondre aux props attendues par le formulaire
interface ContractAvailability {
  id: string;
  day: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
}

interface EditContract {
  id: string;
  contractType: string;
  role: string;
  hoursPerWeek: number | null;
  status: string;
  resignationDate: string;
  endDate: string;
  availability: ContractAvailability[];
}

export default async function ContractEditPage(context: PageContext) {
  // Extraction de l'ID de l'employé depuis le contexte
  const employeeId = context.params.id;

  // Récupération du contrat via employeeId avec findFirst
  const contract: PrismaContract | null = await prisma.contract.findFirst({
    where: { employeeId },
    include: { availability: true },
  });

  let editContract: EditContract;
  if (contract && contract.contractType !== null) {
    editContract = {
      ...contract,
      contractType: contract.contractType,
      resignationDate: contract.resignationDate
        ? new Date(contract.resignationDate).toISOString().split("T")[0]
        : "",
      endDate: contract.endDate
        ? new Date(contract.endDate).toISOString().split("T")[0]
        : "",
      availability: contract.availability.map((avail): ContractAvailability => ({
        id: avail.id,
        day: avail.day,
        allDay: avail.allDay,
        startTime: avail.startTime ?? "",
        endTime: avail.endTime ?? "",
      })),
    };
  } else {
    editContract = {
      id: "",
      contractType: "",
      role: "",
      hoursPerWeek: null,
      status: "EN_CONTRAT",
      resignationDate: "",
      endDate: "",
      availability: [],
    };
  }

  return <ContractEditForm employeeId={employeeId} contract={editContract} />;
}
