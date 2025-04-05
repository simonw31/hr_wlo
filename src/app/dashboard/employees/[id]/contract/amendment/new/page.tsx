export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AmendmentEditForm from "../../edit/AmendmentEditForm";

export default async function NewAmendmentPage({
  params,
}: {
  params: { id: string }
}) {
  // Ici, params.id correspond à l'ID du contrat pour lequel on veut créer un avenant.
  const employeeId = params.id;

  // Vérification que le contrat existe
  const contract = await prisma.contract.findFirst({
    where: { employeeId },
  });
  if (!contract) {
    notFound();
  }

  return <AmendmentEditForm contractId={contract.id} />;
}
