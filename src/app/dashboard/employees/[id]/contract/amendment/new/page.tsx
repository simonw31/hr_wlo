export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AmendmentEditForm from "../../edit/AmendmentEditForm";

// Ici, on indique que params est une Promise qui résout un objet ayant une propriété id.
export default async function NewAmendmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Attendre la résolution de params
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;

  // Vérification que le contrat existe
  const contract = await prisma.contract.findFirst({
    where: { employeeId },
  });
  if (!contract) {
    notFound();
  }

  return <AmendmentEditForm contractId={contract.id} employeeId={employeeId} />;
}
