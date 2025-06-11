'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, User, Settings, BookOpen, Star } from 'lucide-react'
import { CharacterProfile } from '@/types/novel'
import { NOVEL_SCENARIOS, getDefaultScenario } from '@/config/scenarios'
import { CharacterEditor } from './character-editor'

export function NovelGenerator() {
  const [bossName, setBossName] = useState('')
  const [storyTitle, setStoryTitle] = useState('')
  const [selectedScenario, setSelectedScenario] = useState(getDefaultScenario().id)
  const [generatedContent, setGeneratedContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentCharacter, setCurrentCharacter] = useState<CharacterProfile | null>(null)
  const [isCharacterEditorOpen, setIsCharacterEditorOpen] = useState(false)

  // 加载保存的角色数据
  useEffect(() => {
    const savedCharacter = localStorage.getItem('novel_character')
    if (savedCharacter) {
      try {
        setCurrentCharacter(JSON.parse(savedCharacter))
      } catch (error) {
        console.error('Failed to load character:', error)
      }
    }
  }, [])

  // 保存角色数据
  const saveCharacter = (character: CharacterProfile) => {
    setCurrentCharacter(character)
    localStorage.setItem('novel_character', JSON.stringify(character))
  }

  // 升级角色经验和等级
  const levelUpCharacter = (character: CharacterProfile): CharacterProfile => {
    const updatedCharacter = {
      ...character,
      creationCount: character.creationCount + 1,
      experiencePoints: character.experiencePoints + 50
    }

    // 检查是否升级
    const nextLevelExp = updatedCharacter.level * 100
    if (updatedCharacter.experiencePoints >= nextLevelExp) {
      updatedCharacter.level += 1
      updatedCharacter.experiencePoints = updatedCharacter.experiencePoints % nextLevelExp
    }

    return updatedCharacter
  }

  const handleGenerate = async () => {
    if (!bossName.trim() || !storyTitle.trim()) {
      alert('请填写老板姓名和故事题目')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-novel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bossName: bossName.trim(),
          storyTitle: storyTitle.trim(),
          scenario: selectedScenario,
          character: currentCharacter,
        }),
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const data = await response.json()
      setGeneratedContent(data.content)

      // 升级角色（如果有角色的话）
      if (currentCharacter) {
        const leveledUpCharacter = levelUpCharacter(currentCharacter)
        saveCharacter(leveledUpCharacter)
      }
    } catch (error) {
      console.error('生成错误:', error)
      alert('生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setBossName('')
    setStoryTitle('')
    setGeneratedContent('')
  }

  const handleCharacterSave = (character: CharacterProfile) => {
    saveCharacter(character)
  }

  const selectedScenarioData = NOVEL_SCENARIOS.find(s => s.id === selectedScenario) || getDefaultScenario()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI爽文创作工具 - 多场景角色养成版
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 场景选择区域 */}
        <div className="space-y-2">
          <Label htmlFor="scenario-select">选择创作场景</Label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger id="scenario-select">
              <SelectValue placeholder="选择一个创作场景" />
            </SelectTrigger>
            <SelectContent>
              {NOVEL_SCENARIOS.map(scenario => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{scenario.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{selectedScenarioData.description}</p>
          <div className="flex flex-wrap gap-1">
            {selectedScenarioData.keywords.map(keyword => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* 角色管理区域 */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              我的角色
            </Label>
            <Dialog open={isCharacterEditorOpen} onOpenChange={setIsCharacterEditorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  {currentCharacter ? '编辑角色' : '创建角色'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <CharacterEditor
                  character={currentCharacter}
                  onCharacterChange={handleCharacterSave}
                  onClose={() => setIsCharacterEditorOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {currentCharacter ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentCharacter.name}</span>
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Lv.{currentCharacter.level}
                </Badge>
                <Badge variant="outline">
                  {currentCharacter.identity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {currentCharacter.personality}
              </p>
              <div className="flex flex-wrap gap-1">
                {currentCharacter.specialTraits.slice(0, 3).map(trait => (
                  <Badge key={trait} variant="secondary" className="text-xs">
                    {trait}
                  </Badge>
                ))}
                {currentCharacter.specialTraits.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{currentCharacter.specialTraits.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              创建专属角色，让AI根据角色特点生成更个性化的故事内容！
            </p>
          )}
        </div>

        {/* 基本信息输入 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="boss-name">老板姓名</Label>
            <Input
              id="boss-name"
              placeholder="请输入老板的姓名，如：李总、王总..."
              value={bossName}
              onChange={(e) => setBossName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="story-title">故事题目</Label>
            <Input
              id="story-title"
              placeholder="请输入故事题目，如：重返职场的逆袭..."
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !bossName.trim() || !storyTitle.trim()}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI正在创作中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                生成{selectedScenarioData.name}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
            disabled={isLoading}
          >
            清空内容
          </Button>
        </div>

        {/* 生成结果展示 */}
        {generatedContent && (
          <div className="space-y-2">
            <Label>生成的故事内容</Label>
            <Textarea
              value={generatedContent}
              readOnly
              className="min-h-[400px] resize-none bg-muted/50"
              placeholder="生成的故事内容将显示在这里..."
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {currentCharacter && (
                  <Badge variant="secondary" className="text-xs">
                    角色升级 +50 EXP
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent)
                  alert('内容已复制到剪贴板')
                }}
              >
                复制内容
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 