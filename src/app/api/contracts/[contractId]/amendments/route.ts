// app/api/contracts/[contractId]/amendments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAmendment, getAmendmentsByContract } from "@/lib/services/amendmentService";

export async function GET(
  request: NextRequest,
  context: unknown
): Promise<NextResponse> {
  const { params } = context as { params: { contractId: string } };
  try {
    const amendments = await getAmendmentsByContract(params.contractId);
    return NextResponse.json(amendments, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors de la récupération.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: unknown
): Promise<NextResponse> {
  const { params } = context as { params: { contractId: string } };
  try {
    const body = await request.json();
    const { startDate, endDate, newHoursPerWeek, isTemporary } = body;
    if (!startDate || typeof isTemporary !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const amendment = await createAmendment({
      contractId: params.contractId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      newHoursPerWeek: newHoursPerWeek ? parseInt(newHoursPerWeek, 10) : null,
      isTemporary,
    });
    return NextResponse.json(amendment, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors de la création.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
