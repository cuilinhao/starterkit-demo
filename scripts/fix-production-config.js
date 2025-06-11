#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 生产环境配置修复工具\n');

const envPath = '.env.local';
const domain = 'linhao.space';

// 读取当前的环境变量文件
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ 无法读取 .env.local 文件');
  process.exit(1);
}

console.log('🔍 检测需要修复的配置问题:\n');

let hasChanges = false;
let newContent = envContent;

// 1. 修复 NEXT_PUBLIC_SITE_URL
if (envContent.includes('NEXT_PUBLIC_SITE_URL=http://localhost:3000')) {
  console.log('1. ❌ NEXT_PUBLIC_SITE_URL 配置错误');
  console.log(`   当前: http://localhost:3000`);
  console.log(`   修复为: https://${domain}`);
  
  newContent = newContent.replace(
    'NEXT_PUBLIC_SITE_URL=http://localhost:3000',
    `NEXT_PUBLIC_SITE_URL=https://${domain}`
  );
  hasChanges = true;
} else if (envContent.includes(`NEXT_PUBLIC_SITE_URL=https://${domain}`)) {
  console.log('1. ✅ NEXT_PUBLIC_SITE_URL 已正确配置');
} else {
  console.log('1. ⚠️ 未找到 NEXT_PUBLIC_SITE_URL 配置');
}

// 2. 修复 CREEM_SUCCESS_URL
if (envContent.includes('CREEM_SUCCESS_URL=http://localhost:3000/success')) {
  console.log('2. ❌ CREEM_SUCCESS_URL 配置错误');
  console.log(`   当前: http://localhost:3000/success`);
  console.log(`   修复为: https://${domain}/success`);
  
  newContent = newContent.replace(
    'CREEM_SUCCESS_URL=http://localhost:3000/success',
    `CREEM_SUCCESS_URL=https://${domain}/success`
  );
  hasChanges = true;
} else if (envContent.includes(`CREEM_SUCCESS_URL=https://${domain}/success`)) {
  console.log('2. ✅ CREEM_SUCCESS_URL 已正确配置');
} else {
  console.log('2. ⚠️ 未找到 CREEM_SUCCESS_URL 配置');
}

// 3. 检查 CREEM_API_KEY 配置
const creemApiKeyMatch = envContent.match(/CREEM_API_KEY=(.+)/);
if (creemApiKeyMatch) {
  const apiKey = creemApiKeyMatch[1];
  if (apiKey.startsWith('creem_')) {
    console.log('3. ✅ CREEM_API_KEY 格式正确');
  } else {
    console.log('3. ⚠️ CREEM_API_KEY 格式可能有问题 (应以 creem_ 开头)');
  }
} else {
  console.log('3. ❌ 未找到 CREEM_API_KEY 配置');
}

// 应用修改
if (hasChanges) {
  try {
    fs.writeFileSync(envPath, newContent);
    console.log('\n✅ 配置文件已更新成功!');
    
    console.log('\n📝 下一步操作:');
    console.log('1. 在 Vercel 项目设置中更新以下环境变量:');
    console.log(`   - NEXT_PUBLIC_SITE_URL=https://${domain}`);
    console.log(`   - CREEM_SUCCESS_URL=https://${domain}/success`);
    console.log('2. 如果 CREEM_API_KEY 认证失败，请：');
    console.log('   - 检查 Creem.io 仪表板中的 API 密钥是否正确');
    console.log('   - 确认密钥权限包含创建 checkout session');
    console.log('   - 尝试重新生成 API 密钥');
    console.log('3. 重新部署项目');
    
  } catch (error) {
    console.log('\n❌ 无法写入配置文件:', error.message);
  }
} else {
  console.log('\n💡 本地配置已是最新，无需修复');
  console.log('\n📝 如果生产环境仍有问题，请检查:');
  console.log('1. Vercel 环境变量是否与本地一致');
  console.log('2. CREEM_API_KEY 是否在 Creem.io 仪表板中有效');
  console.log('3. 是否需要重新生成 API 密钥');
}

console.log('\n🔍 当前配置总结:');
console.log(`✓ 目标域名: ${domain}`);
console.log(`✓ 站点URL: https://${domain}`);
console.log(`✓ 成功页面: https://${domain}/success`);
console.log(`✓ API地址: https://api.creem.io`);

console.log('\n💡 常见问题解决方案:');
console.log('• 401 Unauthorized: API密钥无效或权限不足');
console.log('• 500 Internal Server Error: Creem服务器问题或请求参数错误');
console.log('• 网络错误: 检查网络连接和API地址');
console.log('• 域名问题: 确保生产环境使用正确的域名配置'); 