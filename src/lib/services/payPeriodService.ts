// lib/services/payPeriodService.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  salaryMonth: string;
}

export async function createPayPeriod(data: { startDate: Date; endDate: Date; salaryMonth: string }): Promise<PayPeriod> {
  const payPeriod = await prisma.payPeriod.create({
    data: {
      startDate: data.startDate,
      endDate: data.endDate,
      salaryMonth: data.salaryMonth,
    },
  });
  return payPeriod;
}

export async function getAllPayPeriods(): Promise<PayPeriod[]> {
  return prisma.payPeriod.findMany({
    orderBy: {
      startDate: "desc",
    },
  });
}

export async function getPayPeriodById(id: string): Promise<PayPeriod | null> {
  return prisma.payPeriod.findUnique({
    where: { id },
  });
}

export async function updatePayPeriod(id: string, data: { startDate: Date; endDate: Date; salaryMonth: string }): Promise<PayPeriod> {
  return prisma.payPeriod.update({
    where: { id },
    data: {
      startDate: data.startDate,
      endDate: data.endDate,
      salaryMonth: data.salaryMonth,
    },
  });
}

export async function deletePayPeriod(id: string): Promise<PayPeriod> {
  return prisma.payPeriod.delete({
    where: { id },
  });
}

export function calculatePayForPeriod(params: {
  contractHours: number;
  extraHours10: number;
  extraHours25: number;
  extraHours50: number;
}) {
  return (
    params.contractHours * 4.33 +
    params.extraHours10 +
    params.extraHours25 +
    params.extraHours50
  );
}
