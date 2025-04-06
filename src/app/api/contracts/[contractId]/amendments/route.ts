// app/api/contracts/[contractId]/amendments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAmendment, getAmendmentsByContract } from "@/lib/services/amendmentService";

export async function GET(
  request: NextRequest,
  context: { params: { contractId: string | string[] } }
): Promise<NextResponse> {
  try {
    const { contractId } = context.params;
    // Si contractId est un tableau, on prend le premier élément
    const contractIdStr = Array.isArray(contractId) ? contractId[0] : contractId;
    const amendments = await getAmendmentsByContract(contractIdStr);
    return NextResponse.json(amendments, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue lors de la récupération.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { contractId: string | string[] } }
): Promise<NextResponse> {
  try {
    const { contractId } = context.params;
    const contractIdStr = Array.isArray(contractId) ? contractId[0] : contractId;
    const body = await request.json();
    // Attendu : startDate, endDate (optionnel), newHoursPerWeek, isTemporary
    const { startDate, endDate, newHoursPerWeek, isTemporary } = body;
    if (!startDate || typeof isTemporary !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const amendment = await createAmendment({
      contractId: contractIdStr,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      newHoursPerWeek: newHoursPerWeek ? parseInt(newHoursPerWeek, 10) : null,
      isTemporary,
    });
    return NextResponse.json(amendment, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue lors de la création.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
