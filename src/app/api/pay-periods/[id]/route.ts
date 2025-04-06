// app/api/pay-periods/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updatePayPeriod, deletePayPeriod } from "@/lib/services/payPeriodService";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const deleted = await deletePayPeriod(params.id);
    return NextResponse.json(deleted, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { startDate, endDate, salaryMonth } = body;
    if (!startDate || !endDate || !salaryMonth) {
      return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
    }
    const updated = await updatePayPeriod(params.id, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      salaryMonth,
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
