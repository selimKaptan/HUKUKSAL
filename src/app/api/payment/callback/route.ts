import { NextRequest, NextResponse } from "next/server";
import getIyzipay from "@/lib/iyzico";

export async function POST(request: NextRequest) {
  try {
    const iyzipay = getIyzipay();
    if (!iyzipay) {
      return NextResponse.redirect(new URL("/payment/fail", request.url));
    }

    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!token) {
      return NextResponse.redirect(new URL("/payment/fail", request.url));
    }

    return new Promise<NextResponse>((resolve) => {
      iyzipay.checkoutForm.retrieve({ locale: "tr", token }, (err: unknown, result: Record<string, unknown>) => {
        if (err || result.paymentStatus !== "SUCCESS") {
          resolve(NextResponse.redirect(new URL("/payment/fail", request.url)));
          return;
        }

        const basketId = result.basketId as string || "";
        const planId = basketId.split("_")[1] || "pro_monthly";
        resolve(NextResponse.redirect(
          new URL(`/payment/success?planId=${planId}&paymentId=${result.paymentId}`, request.url)
        ));
      });
    });
  } catch {
    return NextResponse.redirect(new URL("/payment/fail", request.url));
  }
}
