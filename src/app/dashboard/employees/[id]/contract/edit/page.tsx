export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import ContractEditForm from "./ContractEditForm";

// Utilitaire pour forcer T à être une promesse, sans utiliser "any"
type Asyncify<T> = T extends Promise<unknown> ? T : Promise<T>;

// On définit nos props en forçant params à être asynchrone
type PageProps = {
  params: Asyncify<{ id: string }>;
};

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
  // Ici, params est forcé en Promise<{ id: string }>, ce qui satisfait la contrainte
  const { id } = await params;
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
