export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContractEditForm from "../edit/ContractEditForm";

// On ne précise pas explicitement le type de props pour laisser Next.js inférer PageProps
export default async function NewContractPage(props: { params: unknown }) {
  // On transforme props.params en une promesse puis on attend sa résolution.
  // Si props.params est déjà un objet, Promise.resolve le renverra tel quel.
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
    availability: [] as any, // typage de l'array si besoin
  };

  return (
    <ContractEditForm employeeId={employeeId} contract={newContract} />
  );
}
