#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 环境变量修复工具\n');

const envPath = '.env.local';

// 读取当前的环境变量文件
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ 无法读取 .env.local 文件');
  process.exit(1);
}

console.log('🔍 检测到的问题:\n');

let hasChanges = false;
let newContent = envContent;

// 修复 CREEM_API_URL
if (envContent.includes('https://linhao.space/webhook/creem')) {
  console.log('1. ❌ CREEM_API_URL 配置错误');
  console.log('   当前: https://linhao.space/webhook/creem');
  console.log('   修复为: https://api.creem.io');
  
  newContent = newContent.replace(
    'CREEM_API_URL=https://linhao.space/webhook/creem',
    'CREEM_API_URL=https://api.creem.io'
  );
  hasChanges = true;
}

// 检查其他需要修复的配置
if (envContent.includes('NEXT_PUBLIC_SITE_URL=http://localhost:3000')) {
  console.log('2. ⚠️ NEXT_PUBLIC_SITE_URL 使用本地地址');
  console.log('   建议修改为你的真实域名');
}

if (envContent.includes('CREEM_SUCCESS_URL=http://localhost:3000/success')) {
  console.log('3. ⚠️ CREEM_SUCCESS_URL 使用本地地址');
  console.log('   建议修改为你的真实域名/success');
}

if (hasChanges) {
  // 创建备份
  const backupPath = '.env.local.backup';
  fs.writeFileSync(backupPath, envContent);
  console.log(`\n💾 已创建备份文件: ${backupPath}`);
  
  // 写入修复后的内容
  fs.writeFileSync(envPath, newContent);
  console.log('✅ 已修复 CREEM_API_URL 配置\n');
  
  console.log('🎉 修复完成！主要问题已解决：');
  console.log('• CREEM_API_URL 已修复为正确的API地址');
  console.log('• 支付功能现在应该可以正常工作了\n');
  
  console.log('📝 下一步操作:');
  console.log('1. 如果这是生产环境，请同时在 Vercel 中更新环境变量');
  console.log('2. 更新 NEXT_PUBLIC_SITE_URL 和 CREEM_SUCCESS_URL 为你的真实域名');
  console.log('3. 重新部署项目');
  
} else {
  console.log('✅ 未发现需要自动修复的问题');
}

console.log('\n🧪 建议执行以下测试:');
console.log('• 运行: node scripts/test-env.js (验证修复效果)');
console.log('• 测试支付功能');
console.log('• 测试AI创作功能');

console.log('\n💡 环境变量完整配置指南:');
console.log('生产环境应该配置为:');
console.log('• NEXT_PUBLIC_SITE_URL=https://你的域名');
console.log('• CREEM_SUCCESS_URL=https://你的域名/success');
console.log('• CREEM_API_URL=https://api.creem.io'); 