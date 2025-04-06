import { NextRequest, NextResponse } from "next/server";
import { createPayPeriod, getAllPayPeriods } from "@/lib/services/payPeriodService";

export async function GET(): Promise<NextResponse> {
  try {
    const payPeriods = await getAllPayPeriods();
    return NextResponse.json(payPeriods, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { startDate, endDate, salaryMonth } = body;

    if (!startDate || !endDate || !salaryMonth) {
      return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
    }

    const newPayPeriod = await createPayPeriod({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      salaryMonth, // le mois auquel la paie est rattachée
    });
    return NextResponse.json(newPayPeriod, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
