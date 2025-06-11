import { NextRequest, NextResponse } from 'next/server'
import { 
  NovelGenerationRequest, 
  NovelGenerationResponse, 
  DeepSeekAPIRequest, 
  DeepSeekAPIResponse 
} from '@/types/novel'
import { getScenarioById, getDefaultScenario } from '@/config/scenarios'

export async function POST(request: NextRequest) {
  try {
    const { bossName, storyTitle, scenario, character }: NovelGenerationRequest = await request.json()

    if (!bossName || !storyTitle) {
      return NextResponse.json(
        { error: '缺少必要参数' }, 
        { status: 400 }
      )
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com'

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: '服务配置错误' }, 
        { status: 500 }
      )
    }

    // 获取选定的场景
    const selectedScenario = getScenarioById(scenario) || getDefaultScenario()

    // 构建基础提示词
    let systemPrompt = `你是一位专业的网络小说作家，擅长创作各种类型的爽文。请根据用户提供的信息，创作一段精彩的${selectedScenario.name}风格的故事内容。

场景设定：${selectedScenario.prompt}

创作要求：
1. 故事类型：${selectedScenario.name}
2. 关键元素：${selectedScenario.keywords.join('、')}
3. 情节要爽快，有逆袭和精彩剧情
4. 内容积极向上，符合主流价值观
5. 字数控制在800-1200字左右
6. 语言生动有趣，节奏紧凑
7. 只返回故事正文内容，不要标题和其他说明文字`

    // 如果有角色信息，加入角色设定
    if (character && character.name) {
      const characterLevel = character.level || 1
      const levelBonus = characterLevel > 5 ? '情节更加精彩复杂，包含更多转折和高潮' : 
                        characterLevel > 3 ? '增加更多细节描写和人物互动' : 
                        '保持情节简洁明快'

      systemPrompt += `

角色设定：
- 主角姓名：${character.name}
- 身份职位：${character.identity}
- 性格特点：${character.personality}
- 背景故事：${character.background}
- 特殊技能：${character.specialTraits.join('、')}
- 角色等级：Lv.${characterLevel} (${levelBonus})

请根据以上角色设定来塑造主角的行为、对话和成长轨迹。角色等级越高，剧情应该越精彩。`
    }

    const userPrompt = `请以"${bossName}"作为老板的姓名，以"${storyTitle}"为故事主题，创作一段${selectedScenario.name}故事。${character ? `主角是${character.name}，一个${character.identity}。` : ''}`

    // 构建API请求
    const apiRequest: DeepSeekAPIRequest = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 2000,
      temperature: character?.level && character.level > 5 ? 0.9 : 0.8, // 高等级角色使用更高创造性
      stream: false
    }

    // 调用DeepSeek API
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(apiRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API Error:', errorText)
      return NextResponse.json(
        { error: 'AI服务暂时不可用' }, 
        { status: 500 }
      )
    }

    const data: DeepSeekAPIResponse = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'AI响应格式错误' }, 
        { status: 500 }
      )
    }

    let content = data.choices[0].message.content

    // 清理内容，只保留正文
    content = content
      .replace(/^#+\s*.+$/gm, '') // 移除标题
      .replace(/^【.+】$/gm, '') // 移除章节标记
      .replace(/^\s*第.+章.*/gm, '') // 移除章节号
      .replace(/^\s*标题：.*/gm, '') // 移除标题行
      .replace(/^\s*题目：.*/gm, '') // 移除题目行
      .trim()

    const result: NovelGenerationResponse = {
      content,
      usage: data.usage
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Generate novel error:', error)
    return NextResponse.json(
      { error: '生成失败' }, 
      { status: 500 }
    )
  }
} 