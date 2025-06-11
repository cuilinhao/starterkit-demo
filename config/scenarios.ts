import { NovelScenario } from '@/types/novel';

export const NOVEL_SCENARIOS: NovelScenario[] = [
  {
    id: 'rebirth-secretary',
    name: '重生秘书',
    description: '重生回到过去，成为老板的贴身秘书',
    keywords: ['重生', '职场', '秘书', '逆袭'],
    prompt: '主角重生回到过去，成为老板的秘书，利用未来的记忆和知识，在职场中逆袭成功的故事。'
  },
  {
    id: 'wealthy-family',
    name: '豪门恩怨',
    description: '豪门家族内部的爱恨情仇',
    keywords: ['豪门', '家族', '继承', '权力'],
    prompt: '围绕豪门家族展开，涉及财产继承、权力斗争、爱情纠葛的复杂故事。'
  },
  {
    id: 'ceo-romance',
    name: '霸道总裁',
    description: '冷酷总裁与平凡员工的爱情故事',
    keywords: ['总裁', '霸道', '爱情', '契约'],
    prompt: '霸道冷酷的总裁与普通员工之间发生的浪漫爱情故事，充满甜蜜与冲突。'
  },
  {
    id: 'sweet-romance',
    name: '甜宠日常',
    description: '温馨甜蜜的日常恋爱故事',
    keywords: ['甜宠', '日常', '温馨', '治愈'],
    prompt: '温馨甜蜜的日常生活故事，充满温暖治愈的元素，展现美好的爱情生活。'
  },
  {
    id: 'fantasy-cultivation',
    name: '玄幻修仙',
    description: '修仙世界的冒险与成长',
    keywords: ['玄幻', '修仙', '冒险', '升级'],
    prompt: '在玄幻世界中修炼成仙，经历各种冒险和挑战，不断提升实力的成长故事。'
  },
  {
    id: 'campus-youth',
    name: '校园青春',
    description: '校园里的青春回忆与成长',
    keywords: ['校园', '青春', '学生', '友谊'],
    prompt: '发生在校园中的青春故事，包含友谊、爱情、成长和梦想的美好回忆。'
  },
  {
    id: 'entertainment-circle',
    name: '娱乐圈',
    description: '娱乐圈的明星生活与竞争',
    keywords: ['娱乐圈', '明星', '经纪', '竞争'],
    prompt: '围绕娱乐圈展开的故事，涉及明星生活、商业竞争、粉丝文化等元素。'
  },
  {
    id: 'transmigration',
    name: '穿越重生',
    description: '穿越到不同时空的奇幻经历',
    keywords: ['穿越', '重生', '异世界', '金手指'],
    prompt: '主角穿越到不同的时空或世界，利用现代知识和特殊能力改变命运的故事。'
  }
];

export const getScenarioById = (id: string): NovelScenario | undefined => {
  return NOVEL_SCENARIOS.find(scenario => scenario.id === id);
};

export const getDefaultScenario = (): NovelScenario => {
  return NOVEL_SCENARIOS[0]; // 默认返回重生秘书场景
}; 