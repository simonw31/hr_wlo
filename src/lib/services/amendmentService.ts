// lib/services/amendmentService.ts
import { prisma } from "@/lib/prisma";

export interface Amendment {
  id: string;
  contractId: string;
  startDate: Date;
  endDate: Date | null;
  newHoursPerWeek: number | null;
  isTemporary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createAmendment(data: {
  contractId: string;
  startDate: Date;
  endDate?: Date | null;
  newHoursPerWeek?: number | null;
  isTemporary: boolean;
}): Promise<Amendment> {
  const amendment = await prisma.amendment.create({
    data: {
      contractId: data.contractId,
      startDate: data.startDate,
      endDate: data.endDate || null,
      newHoursPerWeek: data.newHoursPerWeek || null,
      isTemporary: data.isTemporary,
    },
  });
  return amendment;
}

export async function getAmendmentsByContract(contractId: string): Promise<Amendment[]> {
  return prisma.amendment.findMany({
    where: { contractId },
    orderBy: { startDate: "asc" },
  });
}
