import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/app/actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, email, userId, productType, creditsAmount, discountCode } = body;

    console.log("🧪 测试支付 API 调用:", {
      productId,
      email,
      userId,
      productType,
      creditsAmount,
      discountCode,
      env: {
        CREEM_API_URL: process.env.CREEM_API_URL,
        CREEM_API_KEY: process.env.CREEM_API_KEY ? "***SET***" : "NOT_SET",
        CREEM_SUCCESS_URL: process.env.CREEM_SUCCESS_URL,
      }
    });

    const checkoutUrl = await createCheckoutSession(
      productId,
      email,
      userId,
      productType,
      creditsAmount,
      discountCode
    );

    return NextResponse.json({
      success: true,
      checkoutUrl,
      message: "Checkout session created successfully"
    });

  } catch (error: any) {
    console.error("❌ 测试支付 API 错误:", error);

    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        details: error.details || null,
        stack: error.stack
      }
    }, { 
      status: error.details?.status || 500 
    });
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Payment test API is running",
    env: {
      CREEM_API_URL: process.env.CREEM_API_URL,
      CREEM_API_KEY: process.env.CREEM_API_KEY ? "***SET***" : "NOT_SET",
      CREEM_SUCCESS_URL: process.env.CREEM_SUCCESS_URL,
    }
  });
} 