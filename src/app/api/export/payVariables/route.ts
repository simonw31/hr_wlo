// app/api/export/payVariables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generatePayVariablesCSV } from "@/lib/services/exportService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payPeriodId = searchParams.get("payPeriodId");
    if (!payPeriodId) {
      return NextResponse.json({ error: "Missing payPeriodId parameter" }, { status: 400 });
    }
    const csv = await generatePayVariablesCSV(payPeriodId);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="pay_variables_${payPeriodId}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
