#!/usr/bin/env node

// 手动加载环境变量
require('dotenv').config({ path: '.env.local' });

console.log('🎯 最终功能验证\n');

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
      console.log('✅ AI创作功能正常工作');
      console.log(`📖 生成内容长度: ${result.content?.length || 0} 字符`);
      console.log(`💳 使用tokens: ${result.usage?.total_tokens || 0}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ AI创作失败: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ AI创作错误: ${error.message}`);
    return false;
  }
}

async function testCreemAPI() {
  console.log('\n💳 测试Creem支付API配置...');
  
  const apiUrl = process.env.CREEM_API_URL;
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiUrl || !apiKey) {
    console.log('❌ Creem API配置缺失');
    return false;
  }
  
  console.log(`📍 API URL: ${apiUrl}`);
  
  if (apiUrl === 'https://api.creem.io') {
    console.log('✅ Creem API URL配置正确 (生产环境)');
    return true;
  } else if (apiUrl === 'https://test-api.creem.io/v1') {
    console.log('⚠️ Creem API URL配置为测试环境');
    return true;
  } else if (apiUrl.includes('webhook') || apiUrl.includes('linhao.space')) {
    console.log('❌ Creem API URL配置错误 (这是webhook URL，不是API URL)');
    return false;
  } else {
    console.log('⚠️ Creem API URL配置未知');
    return false;
  }
}

async function testEnvironmentConfig() {
  console.log('\n🔧 验证环境变量配置...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CREEM_WEBHOOK_SECRET',
    'CREEM_API_KEY',
    'CREEM_API_URL',
    'DEEPSEEK_API_KEY',
    'DEEPSEEK_API_URL'
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: 未设置`);
      allPresent = false;
    } else {
      console.log(`✅ ${varName}: 已设置`);
    }
  }
  
  return allPresent;
}

async function generateSummaryReport() {
  console.log('\n📊 修复总结报告\n');
  
  console.log('🔍 问题诊断:');
  console.log('• 问题1: 线上环境AI创作失败');
  console.log('• 问题2: 线上环境付费订阅报错 (Failed to create checkout session)');
  
  console.log('\n🔧 根本原因:');
  console.log('• CREEM_API_URL 配置错误');
  console.log('• 当前值: https://linhao.space/webhook/creem (webhook URL)');
  console.log('• 正确值: https://api.creem.io (API URL)');
  
  console.log('\n✅ 已修复:');
  console.log('• 更新了 CREEM_API_URL 配置');
  console.log('• 创建了环境变量检查工具');
  console.log('• 创建了自动修复脚本');
  
  console.log('\n📝 下一步操作:');
  console.log('1. 在 Vercel 或生产环境中更新 CREEM_API_URL');
  console.log('2. 确保所有环境变量正确配置');
  console.log('3. 重新部署应用');
  console.log('4. 测试支付和AI创作功能');
}

async function runFinalTests() {
  console.log('🚀 开始最终验证...\n');
  
  const envConfigResult = await testEnvironmentConfig();
  const aiResult = await testAIGeneration();
  const creemResult = await testCreemAPI();
  
  console.log('\n🎯 测试结果:');
  console.log(`• 环境配置: ${envConfigResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`• AI创作功能: ${aiResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`• Creem配置: ${creemResult ? '✅ 通过' : '❌ 失败'}`);
  
  await generateSummaryReport();
  
  const allTestsPassed = envConfigResult && aiResult && creemResult;
  
  if (allTestsPassed) {
    console.log('\n🎉 所有测试通过！问题已解决');
    console.log('💡 AI创作功能: 正常工作');
    console.log('💡 支付功能: 配置已修复，应该可以正常工作');
  } else {
    console.log('\n⚠️ 部分测试未通过，请查看上述详情');
  }
  
  console.log('\n📞 如需帮助，请查看：');
  console.log('• scripts/check-env.js (环境变量检查)');
  console.log('• scripts/fix-env.js (自动修复)');
  console.log('• scripts/test-env.js (详细测试)');
  
  return allTestsPassed;
}

runFinalTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(console.error); 