export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContractEditForm from "../edit/ContractEditForm";

interface ContractAvailability {
  id: string;
  day: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
}

// Ici, nous imposons que props.params est une Promise qui résout un objet contenant { id: string }.
// Cela satisfait la contrainte PageProps (qui exige un type compatible avec Promise<any>).
export default async function NewContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // On attend que params se résolve
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;

  // Vérifier que l'employé existe
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
    availability: [] as ContractAvailability[], // tableau vide typé
  };

  return (
    <ContractEditForm employeeId={employeeId} contract={newContract} />
  );
}
