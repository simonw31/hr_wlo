export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AmendmentEditForm from "../../edit/AmendmentEditForm";

// On ne typant pas explicitement params dans la signature (ou on le met en unknown)
export default async function NewAmendmentPage({ params }: { params: unknown }) {
  // On effectue une assertion pour obtenir l'objet attendu
  const { id } = params as { id: string };
  const employeeId = id;

  // Vérification que le contrat existe
  const contract = await prisma.contract.findFirst({
    where: { employeeId },
  });
  if (!contract) {
    notFound();
  }

  return <AmendmentEditForm contractId={contract.id} employeeId={employeeId} />;
}
