export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import ContractEditForm from "./ContractEditForm";

// Typage des props de page avec params de type objet synchronisé
interface PageProps {
  params: { id: string };
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

export default async function ContractEditPage({ params }: PageProps) {
  // Ici, params est déjà un objet synchronisé, pas besoin d'attendre
  const { id } = params;
  const employeeId = id;

  // Récupération du contrat via employeeId
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
      availability: [] as ContractAvailability[],
    };
  }

  return <ContractEditForm employeeId={employeeId} contract={editContract} />;
}
