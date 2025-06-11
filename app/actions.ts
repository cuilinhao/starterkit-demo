"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect("success", "/dashboard", "Thanks for signing up!");
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/dashboard/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function createCheckoutSession(
  productId: string,
  email: string,
  userId: string,
  productType: "subscription" | "credits",
  credits_amount?: number,
  discountCode?: string
) {
  const requestId = `${userId}-${Date.now()}`;
  const apiUrl = process.env.CREEM_API_URL + "/v1/checkouts";
  
  // 记录详细的环境信息
  const environmentInfo = {
    CREEM_API_URL: process.env.CREEM_API_URL,
    CREEM_SUCCESS_URL: process.env.CREEM_SUCCESS_URL,
    CREEM_API_KEY: process.env.CREEM_API_KEY ? `${process.env.CREEM_API_KEY.substring(0, 8)}...` : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const requestContext = {
    action: 'createCheckoutSession',
    productId,
    email,
    userId,
    productType,
    creditsAmount: credits_amount,
    discountCode,
    environment: environmentInfo,
    requestId,
    apiUrl
  };
  
  try {
    // 双保险确保总能拿到 success_url
    const successUrl =
      process.env.CREEM_SUCCESS_URL ??
      `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`; // 双保险

    const requestBody: any = {
      product_id: productId,
      request_id: requestId,
      customer: {
        email: email,
      },
      success_url: successUrl,          // ★ 不再缺失
      metadata: {
        user_id: userId,
        product_type: productType,
        credits: credits_amount || 0,
      },
    };

    // 添加折扣码（如果有）
    if (discountCode) {
      requestBody.discount_code = discountCode;
    }

    console.log("🚀 Creating checkout session:", {
      productId,
      email,
      userId,
      productType,
      apiUrl,
      requestId,
      requestBody: JSON.stringify(requestBody, null, 2),
      headers: {
        'x-api-key': process.env.CREEM_API_KEY ? `${process.env.CREEM_API_KEY.substring(0, 8)}...` : 'NOT_SET',
        'Content-Type': 'application/json'
      },
      environment: environmentInfo
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": process.env.CREEM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Creem error →', response.status, text);   // 线上可直接定位
      
      // 尝试解析错误响应
      let errorResponse: any = null;
      try {
        if (text) {
          errorResponse = JSON.parse(text);
        }
      } catch {
        // 如果不是JSON，保持原文本
        errorResponse = text;
      }

      console.error("🚨 Creem API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        requestId,
        response: errorResponse,
        headers: Object.fromEntries(response.headers.entries())
      });

      // 创建详细的错误对象
      const detailedError = new Error(`creem-${response.status}`);
      (detailedError as any).details = {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        timestamp: new Date().toISOString(),
        requestId,
        response: errorResponse,
        message: errorResponse?.message || errorResponse || `HTTP ${response.status} - ${response.statusText}`,
        errorCode: errorResponse?.code || errorResponse?.error_code || `HTTP_${response.status}`,
        requestBody: requestBody,
        requestHeaders: {
          'x-api-key': process.env.CREEM_API_KEY ? `${process.env.CREEM_API_KEY.substring(0, 8)}...` : 'NOT_SET',
          'Content-Type': 'application/json'
        },
        environment: environmentInfo,
        context: requestContext
      };

      throw detailedError;
    }

    const data = await response.json();
    console.log("✅ Checkout session created successfully:", {
      requestId,
      checkoutUrl: data.checkout_url
    });
    
    return data.checkout_url;
  } catch (error: any) {
    console.error("💥 Error creating checkout session:", {
      error: error?.message || error,
      stack: error?.stack,
      details: error?.details,
      requestId,
      apiUrl
    });
    
    // 如果是我们创建的详细错误，直接抛出
    if (error?.details) {
      throw error;
    }
    
    // 否则包装为详细错误
    const wrappedError = new Error(`Checkout Error: ${error?.message || 'Unknown error'}`);
    (wrappedError as any).details = {
      status: 0,
      statusText: 'Network Error',
      url: apiUrl,
      timestamp: new Date().toISOString(),
      requestId,
      message: error?.message || 'Unknown error',
      errorCode: 'NETWORK_ERROR',
      response: null,
      originalError: error?.message || error,
      environment: environmentInfo,
      context: requestContext
    };
    
    throw wrappedError;
  }
}
