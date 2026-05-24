import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "not_implemented",
      message:
        "Search proxy is reserved for a later step. The current skeleton performs direct client-side search redirects.",
    },
    { status: 501 },
  );
}
