import { NextRequest, NextResponse } from "next/server";
import getIyzipay from "@/lib/iyzico";
import { getPlanById } from "@/lib/plans";

export async function POST(request: NextRequest) {
  try {
    const { planId, user } = await request.json();

    const plan = getPlanById(planId);
    if (!plan || plan.priceValue === 0) {
      return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
    }

    const iyzipay = getIyzipay();
    if (!iyzipay) {
      return NextResponse.json({
        error: "Ödeme sistemi henüz yapılandırılmamış. iyzico API anahtarlarını ekleyin.",
      }, { status: 503 });
    }

    const baseUrl = request.headers.get("origin") || "http://localhost:3000";

    const paymentRequest = {
      locale: "tr",
      conversationId: `conv_${Date.now()}`,
      price: plan.priceValue.toString(),
      paidPrice: plan.priceValue.toString(),
      currency: "TRY",
      basketId: `basket_${planId}_${Date.now()}`,
      paymentGroup: "SUBSCRIPTION",
      callbackUrl: `${baseUrl}/api/payment/callback`,
      enabledInstallments: [1, 2, 3, 6],
      buyer: {
        id: user.id || `user_${Date.now()}`,
        name: user.name?.split(" ")[0] || "Ad",
        surname: user.name?.split(" ").slice(1).join(" ") || "Soyad",
        email: user.email || "user@example.com",
        identityNumber: "11111111111",
        registrationAddress: "Türkiye",
        ip: "85.34.78.112",
        city: "Istanbul",
        country: "Turkey",
      },
      billingAddress: {
        contactName: user.name || "Kullanıcı",
        city: "Istanbul",
        country: "Turkey",
        address: "Türkiye",
      },
      basketItems: [
        {
          id: planId,
          name: `JusticeGuard ${plan.name} Plan`,
          category1: "Abonelik",
          itemType: "VIRTUAL",
          price: plan.priceValue.toString(),
        },
      ],
    };

    return new Promise<NextResponse>((resolve) => {
      iyzipay.checkoutFormInitialize.create(paymentRequest, (err: unknown, result: Record<string, unknown>) => {
        if (err || result.status !== "success") {
          resolve(NextResponse.json({
            error: "Ödeme formu oluşturulamadı",
            details: err || result.errorMessage,
          }, { status: 500 }));
          return;
        }

        resolve(NextResponse.json({
          checkoutFormContent: result.checkoutFormContent,
          token: result.token,
          paymentPageUrl: result.paymentPageUrl,
        }));
      });
    });
  } catch (error) {
    console.error("Payment checkout error:", error);
    return NextResponse.json({ error: "Ödeme işlemi başlatılamadı" }, { status: 500 });
  }
}
