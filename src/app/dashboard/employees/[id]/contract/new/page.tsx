export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContractEditForm from "../edit/ContractEditForm";

export default async function NewContractPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // Attendre que params soit résolu
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;

  // Optionnel : vérifier si l'employé existe
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee) {
    notFound();
  }

  // On crée un objet "contrat" par défaut (vide)
  const newContract = {
    id: "", // id vide => création
    contractType: "",
    role: "",
    hoursPerWeek: null,
    status: "EN_CONTRAT", // par défaut
    resignationDate: "",
    endDate: "", // Ajouté pour les CDD
    availability: [], // aucune disponibilité par défaut
  };

  return (
    <ContractEditForm employeeId={employeeId} contract={newContract} />
  );
}
