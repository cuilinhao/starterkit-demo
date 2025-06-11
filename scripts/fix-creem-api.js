const fs = require('fs');
const path = require('path');

console.log('🔧 Creem.io API 修复工具');
console.log('===============================');

// 读取当前环境变量
const envFilePath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envFilePath)) {
  envContent = fs.readFileSync(envFilePath, 'utf8');
} else {
  console.log('❌ .env.local 文件不存在');
  process.exit(1);
}

console.log('📋 当前环境配置分析：');

// 分析当前配置
const lines = envContent.split('\n');
const envVars = {};

lines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
});

// 检查关键配置
const criticalVars = [
  'CREEM_API_KEY',
  'CREEM_API_URL',
  'CREEM_SUCCESS_URL'
];

console.log('\n🔍 关键变量检查：');
criticalVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    if (varName === 'CREEM_API_KEY') {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: 未设置`);
  }
});

// 检查API Key格式
const apiKey = envVars['CREEM_API_KEY'];
if (apiKey) {
  console.log('\n🔑 API Key 格式分析：');
  console.log(`   长度: ${apiKey.length}`);
  console.log(`   前缀: ${apiKey.substring(0, 6)}...`);
  
  if (!apiKey.startsWith('creem_')) {
    console.log('⚠️  警告: API Key 格式可能不正确，应该以 "creem_" 开头');
  }
  
  if (apiKey.length < 20) {
    console.log('⚠️  警告: API Key 长度可能不够');
  }
}

// 提供修复建议
console.log('\n💡 修复建议：');

const fixes = [];

// 1. API Key 问题
if (!apiKey || !apiKey.startsWith('creem_')) {
  fixes.push({
    issue: 'API Key 格式或值问题',
    solution: [
      '1. 登录 Creem.io 仪表盘 (https://dashboard.creem.io)',
      '2. 导航到 "Developers" 部分',
      '3. 点击眼睛图标显示你的 API key',
      '4. 复制正确的 API key (应该以 "creem_" 开头)',
      '5. 更新 CREEM_API_KEY 环境变量'
    ]
  });
}

// 2. API URL 检查
if (envVars['CREEM_API_URL'] !== 'https://api.creem.io') {
  fixes.push({
    issue: 'API URL 不正确',
    solution: ['确保 CREEM_API_URL=https://api.creem.io']
  });
}

// 3. Success URL 检查
if (!envVars['CREEM_SUCCESS_URL'] || envVars['CREEM_SUCCESS_URL'].includes('localhost')) {
  fixes.push({
    issue: 'Success URL 配置错误',
    solution: ['设置 CREEM_SUCCESS_URL=https://linhao.space/success']
  });
}

if (fixes.length === 0) {
  console.log('✅ 环境配置看起来是正确的');
  console.log('\n🧪 可能的其他问题：');
  console.log('1. API Key 可能已过期或被禁用');
  console.log('2. Creem.io 账户可能被暂停');
  console.log('3. 产品 ID 可能不存在或无效');
  console.log('\n💡 建议动作：');
  console.log('1. 在 Creem.io 仪表盘中重新生成 API Key');
  console.log('2. 检查账户状态和余额');
  console.log('3. 验证产品 ID 是否正确');
} else {
  fixes.forEach((fix, index) => {
    console.log(`\n${index + 1}. ${fix.issue}:`);
    fix.solution.forEach(step => {
      console.log(`   ${step}`);
    });
  });
}

// 自动修复选项
console.log('\n🔧 自动修复选项：');

const autoFixes = {
  'CREEM_API_URL': 'https://api.creem.io',
  'CREEM_SUCCESS_URL': 'https://linhao.space/success',
  'NEXT_PUBLIC_APP_URL': 'https://linhao.space'
};

let hasChanges = false;
Object.entries(autoFixes).forEach(([key, correctValue]) => {
  if (envVars[key] !== correctValue) {
    console.log(`🔄 修复 ${key}: ${envVars[key]} → ${correctValue}`);
    envVars[key] = correctValue;
    hasChanges = true;
  }
});

if (hasChanges) {
  // 重新构建环境文件
  const newEnvContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // 备份原文件
  const backupPath = `${envFilePath}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, envContent);
  console.log(`💾 原文件已备份到: ${backupPath}`);
  
  // 写入修复后的配置
  fs.writeFileSync(envFilePath, newEnvContent);
  console.log('✅ 环境变量已自动修复');
  
  console.log('\n⚠️  重要提醒：');
  console.log('1. 你仍需要手动更新 CREEM_API_KEY');
  console.log('2. 重启开发服务器以应用更改');
  console.log('3. 如果部署到生产环境，请更新 Vercel 环境变量');
} else {
  console.log('ℹ️  没有可自动修复的配置问题');
}

console.log('\n🧪 测试建议：');
console.log('1. 重启开发服务器: npm run dev');
console.log('2. 访问测试端点: http://localhost:3000/api/test-creem');
console.log('3. 尝试支付流程以验证修复');

console.log('\n📞 如果问题仍然存在：');
console.log('1. 联系 Creem.io 支持团队');
console.log('2. 检查 Creem.io 服务状态');
console.log('3. 验证账户余额和权限'); 