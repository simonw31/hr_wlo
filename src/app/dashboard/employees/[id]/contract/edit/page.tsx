export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import ContractEditForm from "./ContractEditForm";

// Nous forçons l'assertion pour que props soit du type attendu par Next.js
export default async function ContractEditPage(props: unknown) {
  const { params } = props as { params: Promise<{ id: string }> };
  const { id } = await params;
  const employeeId = id;

  // Interfaces pour typer les données
  interface PrismaAvailability {
    id: string;
    day: string;
    allDay: boolean;
    startTime: string | null;
    endTime: string | null;
  }
  // Modification ici : role est de type string | null
  interface PrismaContract {
    id: string;
    contractType: string | null;
    role: string | null;
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

  const contract: PrismaContract | null = await prisma.contract.findFirst({
    where: { employeeId },
    include: { availability: true },
  });

  let editContract: EditContract;
  if (contract && contract.contractType !== null) {
    editContract = {
      ...contract,
      contractType: contract.contractType,
      role: contract.role || "",
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
