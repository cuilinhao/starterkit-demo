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
  const apiUrl = process.env.CREEM_API_URL + "/checkouts";
  
  try {
    const requestBody: any = {
      product_id: productId,
      request_id: requestId,
      customer: {
        email: email,
      },
      metadata: {
        user_id: userId,
        product_type: productType,
        credits: credits_amount || 0,
      },
    };

    // 如果配置了成功重定向 URL，则添加到请求中
    if (process.env.CREEM_SUCCESS_URL) {
      requestBody.success_url = process.env.CREEM_SUCCESS_URL;
    }

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
      requestId
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
      let errorResponse: any = null;
      let errorText = "";
      
      try {
        errorText = await response.text();
        // 尝试解析为JSON
        if (errorText) {
          try {
            errorResponse = JSON.parse(errorText);
          } catch {
            // 如果不是JSON，保持原文本
            errorResponse = errorText;
          }
        }
      } catch (e) {
        errorText = "Failed to read error response";
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
      const detailedError = new Error(`Payment Error: ${response.status} - ${response.statusText}`);
      (detailedError as any).details = {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        timestamp: new Date().toISOString(),
        requestId,
        response: errorResponse,
        message: errorResponse?.message || errorResponse || `HTTP ${response.status} - ${response.statusText}`,
        errorCode: errorResponse?.code || errorResponse?.error_code || `HTTP_${response.status}`
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
      originalError: error?.message || error
    };
    
    throw wrappedError;
  }
}
