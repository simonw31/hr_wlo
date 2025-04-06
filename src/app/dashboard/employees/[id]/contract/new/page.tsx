export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContractEditForm from "../edit/ContractEditForm";

// Définition d'un type pour les disponibilités du contrat
interface ContractAvailability {
  id: string;
  day: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
}

export default async function NewContractPage(props: { params: unknown }) {
  // On attend la résolution de props.params
  const resolvedParams = await Promise.resolve(props.params) as { id: string };
  const employeeId = resolvedParams.id;

  // Vérification que l'employé existe
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee) {
    notFound();
  }

  // Création d'un contrat par défaut (vide)
  const newContract = {
    id: "", // id vide => création
    contractType: "",
    role: "",
    hoursPerWeek: null,
    status: "EN_CONTRAT", // par défaut
    resignationDate: "",
    endDate: "", // pour les CDD
    availability: [] as ContractAvailability[], // typé comme un tableau de ContractAvailability
  };

  return (
    <ContractEditForm employeeId={employeeId} contract={newContract} />
  );
}
