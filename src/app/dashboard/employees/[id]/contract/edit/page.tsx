// /app/dashboard/employees/[id]/contract/edit/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContractEditForm from "./ContractEditForm";

export default async function ContractEditPage(context: any) {
  // Extraction de l'ID de l'employé depuis le contexte
  const employeeId = context.params.id;

  // On récupère le contrat via employeeId avec findFirst (puisque employeeId n'est plus unique)
  const contract = await prisma.contract.findFirst({
    where: { employeeId },
    include: { availability: true },
  });

  let editContract: any;
  if (contract && contract.contractType !== null) {
    editContract = {
      ...contract,
      resignationDate: contract.resignationDate
        ? new Date(contract.resignationDate).toISOString().split("T")[0]
        : "",
      endDate: contract.endDate
        ? new Date(contract.endDate).toISOString().split("T")[0]
        : "",
      availability: contract.availability.map((avail: any) => ({
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
