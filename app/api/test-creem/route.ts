import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.CREEM_API_KEY;
  const apiUrl = process.env.CREEM_API_URL;
  
  if (!apiKey || !apiUrl) {
    return NextResponse.json({
      success: false,
      error: "Missing CREEM_API_KEY or CREEM_API_URL",
      environment: {
        hasApiKey: !!apiKey,
        hasApiUrl: !!apiUrl,
        apiUrlValue: apiUrl
      }
    }, { status: 500 });
  }

  const results = {
    environment: {
      CREEM_API_URL: apiUrl,
      CREEM_API_KEY: apiKey.substring(0, 10) + "...",
      timestamp: new Date().toISOString()
    },
    tests: [] as any[]
  };

  // 测试1: API基础连接
  try {
    console.log("🧪 Testing Creem.io API connection...");
    const testResponse = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });
    
    results.tests.push({
      name: "API Health Check",
      status: testResponse.status,
      success: testResponse.ok,
      response: testResponse.ok ? "API is accessible" : await testResponse.text()
    });
  } catch (error: any) {
    results.tests.push({
      name: "API Health Check",
      status: 0,
      success: false,
      error: error?.message || String(error)
    });
  }

  // 测试2: 产品列表获取
  try {
    console.log("🧪 Testing product listing...");
    const productsResponse = await fetch(`${apiUrl}/products`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const productsData = productsResponse.ok ? await productsResponse.json() : await productsResponse.text();
    
    results.tests.push({
      name: "Products List",
      status: productsResponse.status,
      success: productsResponse.ok,
      response: productsData
    });
  } catch (error: any) {
    results.tests.push({
      name: "Products List",
      status: 0,
      success: false,
      error: error?.message || String(error)
    });
  }

  // 测试3: 特定产品ID验证
  const testProductIds = [
    "prod_2zG6xzCysT3tWDSCzN3FOJ", // Starter订阅
    "prod_MqcjVo0Bpx0rbYmHVlrh2", // Basic Credits
  ];

  for (const productId of testProductIds) {
    try {
      console.log(`🧪 Testing product ID: ${productId}`);
      const productResponse = await fetch(`${apiUrl}/products/${productId}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      const productData = productResponse.ok ? await productResponse.json() : await productResponse.text();
      
      results.tests.push({
        name: `Product ${productId}`,
        status: productResponse.status,
        success: productResponse.ok,
        response: productData
      });
    } catch (error: any) {
      results.tests.push({
        name: `Product ${productId}`,
        status: 0,
        success: false,
        error: error?.message || String(error)
      });
    }
  }

  // 测试4: 简单的checkout session创建测试（使用虚假数据）
  try {
    console.log("🧪 Testing checkout session creation...");
    const checkoutResponse = await fetch(`${apiUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: "test_product",
        request_id: `test_${Date.now()}`,
        customer: {
          email: "test@example.com"
        },
        metadata: {
          test: true
        }
      })
    });
    
    const checkoutData = await checkoutResponse.text();
    
    results.tests.push({
      name: "Checkout Creation Test",
      status: checkoutResponse.status,
      success: checkoutResponse.ok,
      response: checkoutData,
      note: "Using test product ID to check API endpoint availability"
    });
  } catch (error: any) {
    results.tests.push({
      name: "Checkout Creation Test",
      status: 0,
      success: false,
      error: error?.message || String(error)
    });
  }

  return NextResponse.json(results, { status: 200 });
} 