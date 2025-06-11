#!/usr/bin/env node

console.log('🔍 环境变量检查工具\n');

// 检查所需的环境变量
const requiredEnvVars = {
  // Supabase 配置
  'NEXT_PUBLIC_SUPABASE_URL': '你的 Supabase 项目 URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': '你的 Supabase 匿名 key',
  'SUPABASE_SERVICE_ROLE_KEY': '你的 Supabase service role key',
  
  // 站点配置
  'NEXT_PUBLIC_SITE_URL': '你的站点 URL (生产环境应该是https://你的域名)',
  'CREEM_SUCCESS_URL': '支付成功后重定向 URL',
  
  // Creem.io 配置
  'CREEM_WEBHOOK_SECRET': '你的 Creem webhook 密钥',
  'CREEM_API_KEY': '你的 Creem API key', 
  'CREEM_API_URL': 'Creem API URL (生产环境: https://api.creem.io)',
  
  // DeepSeek AI 配置
  'DEEPSEEK_API_KEY': '你的 DeepSeek API key',
  'DEEPSEEK_API_URL': 'DeepSeek API URL (通常是: https://api.deepseek.com)'
};

console.log('📋 检查环境变量配置状态:\n');

let hasErrors = false;
let hasWarnings = false;

for (const [varName, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];
  
  if (!value) {
    console.log(`❌ ${varName}: 未设置`);
    console.log(`   描述: ${description}\n`);
    hasErrors = true;
  } else {
    // 检查常见错误配置
    let status = '✅';
    let message = '';
    
    if (varName === 'CREEM_API_URL') {
      if (value.includes('webhook') || value.includes('linhao.space')) {
        status = '⚠️';
        message = ' (错误: 这应该是API URL，不是webhook URL)';
        hasWarnings = true;
      } else if (value === 'https://test-api.creem.io/v1') {
        status = '⚠️';
        message = ' (警告: 当前使用测试环境)';
        hasWarnings = true;
      }
    }
    
    if (varName === 'NEXT_PUBLIC_SITE_URL') {
      if (value.includes('localhost')) {
        status = '⚠️';
        message = ' (警告: 生产环境应使用真实域名)';
        hasWarnings = true;
      }
    }
    
    if (varName === 'CREEM_SUCCESS_URL') {
      if (value.includes('localhost')) {
        status = '⚠️';
        message = ' (警告: 生产环境应使用真实域名)';
        hasWarnings = true;
      }
    }
    
    console.log(`${status} ${varName}: ${value.substring(0, 20)}...${message}`);
  }
}

console.log('\n🔧 修复建议:\n');

if (hasErrors) {
  console.log('❌ 发现缺失的环境变量，请添加到 .env.local 文件中');
}

if (hasWarnings) {
  console.log('⚠️ 发现配置警告，建议修复:');
  
  if (process.env.CREEM_API_URL && (process.env.CREEM_API_URL.includes('webhook') || process.env.CREEM_API_URL.includes('linhao.space'))) {
    console.log('1. 修复 CREEM_API_URL:');
    console.log('   当前值可能是错误的 webhook URL');
    console.log('   生产环境应设置为: https://api.creem.io');
    console.log('   测试环境应设置为: https://test-api.creem.io/v1\n');
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
    console.log('2. 修复 NEXT_PUBLIC_SITE_URL:');
    console.log('   生产环境应设置为: https://你的真实域名\n');
  }
  
  if (process.env.CREEM_SUCCESS_URL && process.env.CREEM_SUCCESS_URL.includes('localhost')) {
    console.log('3. 修复 CREEM_SUCCESS_URL:');
    console.log('   生产环境应设置为: https://你的真实域名/success\n');
  }
}

if (!hasErrors && !hasWarnings) {
  console.log('✅ 所有环境变量配置正确！');
}

console.log('\n📝 如何修复:');
console.log('1. 编辑 .env.local 文件');
console.log('2. 在 Vercel 项目设置中更新环境变量');
console.log('3. 重新部署项目');

console.log('\n💡 常见问题解决方案:');
console.log('• AI创作失败: 检查 DEEPSEEK_API_KEY 是否有效');
console.log('• 支付失败: 检查 CREEM_API_URL 是否正确设置为 https://api.creem.io');
console.log('• Webhook失败: 检查 CREEM_WEBHOOK_SECRET 是否匹配');

process.exit(hasErrors ? 1 : 0); 