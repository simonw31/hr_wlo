export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AmendmentEditForm from "../../edit/AmendmentEditForm";

export default async function NewAmendmentPage({
  params,
}: { params: any }) {
  // Ici, on suppose que params est déjà résolu et possède une propriété id
  const employeeId = params.id;

  // Vérification que le contrat existe
  const contract = await prisma.contract.findFirst({
    where: { employeeId },
  });
  if (!contract) {
    notFound();
  }

  return <AmendmentEditForm contractId={contract.id} employeeId={employeeId} />;
}
