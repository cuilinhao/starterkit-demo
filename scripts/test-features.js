#!/usr/bin/env node

// 手动加载环境变量
require('dotenv').config({ path: '.env.local' });

console.log('🧪 功能测试工具\n');

async function testAIGeneration() {
  console.log('🤖 测试AI创作功能...');
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-novel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bossName: '王总',
        storyTitle: '测试故事',
        scenario: 'workplace',
        character: {
          name: '小明',
          identity: '程序员',
          personality: '聪明机智',
          background: '刚毕业的大学生',
          specialTraits: ['编程能力强', '学习能力强'],
          level: 1
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ AI创作功能正常');
      console.log(`📖 生成内容长度: ${result.content?.length || 0} 字符`);
      
      if (result.content) {
        console.log(`📝 内容预览: ${result.content.substring(0, 100)}...`);
      }
    } else {
      const error = await response.text();
      console.log(`❌ AI创作功能失败: ${response.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ AI创作功能错误: ${error.message}`);
  }
}

async function testPaymentAPI() {
  console.log('\n💳 测试支付API...');
  
  try {
    // 首先测试健康检查
    console.log('📋 检查支付API状态...');
    const healthResponse = await fetch('http://localhost:3000/api/test-payment');
    const healthData = await healthResponse.json();
    console.log('🏥 API健康状态:', healthData);

    // 测试创建checkout session
    console.log('\n🛒 测试创建支付会话...');
    const response = await fetch('http://localhost:3000/api/test-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'prod_2zG6xzCysT3tWDSCzN3FOJ', // Starter tier
        email: 'test@linhao.space',
        userId: 'test-user-id-' + Date.now(),
        productType: 'subscription'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 支付API正常');
      console.log(`🔗 Checkout URL: ${result.checkoutUrl}`);
      console.log(`📝 消息: ${result.message}`);
    } else {
      console.log(`❌ 支付API失败: ${response.status}`);
      console.log('📄 错误详情:');
      console.log(`   - 消息: ${result.error?.message}`);
      console.log(`   - 状态: ${result.error?.details?.status}`);
      console.log(`   - URL: ${result.error?.details?.url}`);
      console.log(`   - 请求ID: ${result.error?.details?.requestId}`);
      console.log(`   - 响应: ${JSON.stringify(result.error?.details?.response, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ 支付API网络错误: ${error.message}`);
  }
}

async function testEnvironmentConfig() {
  console.log('\n🔧 验证环境配置修复...');
  
  const creemApiUrl = process.env.CREEM_API_URL;
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  
  console.log(`✅ CREEM_API_URL: ${creemApiUrl}`);
  console.log(`✅ DEEPSEEK_API_KEY: ${deepseekApiKey ? '已设置' : '未设置'}`);
  
  if (creemApiUrl === 'https://api.creem.io') {
    console.log('✅ CREEM_API_URL 配置正确 (生产环境)');
  } else if (creemApiUrl === 'https://test-api.creem.io/v1') {
    console.log('⚠️ CREEM_API_URL 配置为测试环境');
  } else {
    console.log('❌ CREEM_API_URL 配置可能有误');
  }
}

async function runTests() {
  console.log('🎯 开始功能测试...\n');
  
  await testEnvironmentConfig();
  await testAIGeneration();
  await testPaymentAPI();
  
  console.log('\n📊 测试总结:');
  console.log('• AI创作功能: 检查上面的测试结果');
  console.log('• 支付功能: 检查上面的测试结果');
  console.log('• 环境配置: CREEM_API_URL 已修复');
  
  console.log('\n🚀 如果所有测试通过，说明问题已解决！');
  console.log('📝 下一步: 在生产环境中同步更新环境变量并重新部署');
}

runTests().catch(console.error); 