'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Star, Trophy, Zap } from 'lucide-react'
import { CharacterProfile } from '@/types/novel'

interface CharacterEditorProps {
  character: CharacterProfile | null
  onCharacterChange: (character: CharacterProfile) => void
  onClose: () => void
}

export function CharacterEditor({ character, onCharacterChange, onClose }: CharacterEditorProps) {
  const [editedCharacter, setEditedCharacter] = useState<CharacterProfile>(
    character || {
      name: '',
      personality: '',
      identity: '',
      background: '',
      level: 1,
      experiencePoints: 0,
      creationCount: 0,
      specialTraits: []
    }
  )

  const [newTrait, setNewTrait] = useState('')

  useEffect(() => {
    if (character) {
      setEditedCharacter(character)
    }
  }, [character])

  const handleSave = () => {
    const savedCharacter = {
      ...editedCharacter,
      id: editedCharacter.id || `char_${Date.now()}`,
      lastUsed: new Date()
    }
    onCharacterChange(savedCharacter)
    onClose()
  }

  const addTrait = () => {
    if (newTrait.trim() && !editedCharacter.specialTraits.includes(newTrait.trim())) {
      setEditedCharacter(prev => ({
        ...prev,
        specialTraits: [...prev.specialTraits, newTrait.trim()]
      }))
      setNewTrait('')
    }
  }

  const removeTrait = (trait: string) => {
    setEditedCharacter(prev => ({
      ...prev,
      specialTraits: prev.specialTraits.filter(t => t !== trait)
    }))
  }

  const getLevelTitle = (level: number) => {
    if (level >= 10) return '创作大师'
    if (level >= 7) return '资深作者'
    if (level >= 4) return '熟练写手'
    if (level >= 2) return '初级创作者'
    return '新手作者'
  }

  const getNextLevelExp = (level: number) => {
    return level * 100
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          角色编辑器
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="growth">成长系统</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="char-name">角色姓名</Label>
                <Input
                  id="char-name"
                  placeholder="输入角色姓名"
                  value={editedCharacter.name}
                  onChange={(e) => setEditedCharacter(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="char-identity">身份职位</Label>
                <Input
                  id="char-identity"
                  placeholder="如：秘书、助理、经理等"
                  value={editedCharacter.identity}
                  onChange={(e) => setEditedCharacter(prev => ({ ...prev, identity: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="char-personality">性格特点</Label>
                <Textarea
                  id="char-personality"
                  placeholder="描述角色的性格特点，如：聪明机敏、温柔善良、坚强独立等"
                  value={editedCharacter.personality}
                  onChange={(e) => setEditedCharacter(prev => ({ ...prev, personality: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="char-background">背景故事</Label>
                <Textarea
                  id="char-background"
                  placeholder="角色的背景经历和重要故事"
                  value={editedCharacter.background}
                  onChange={(e) => setEditedCharacter(prev => ({ ...prev, background: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>特殊技能标签</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="添加技能标签"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                  />
                  <Button onClick={addTrait} variant="outline" size="sm">
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {editedCharacter.specialTraits.map(trait => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTrait(trait)}
                    >
                      {trait} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-semibold">等级信息</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">当前等级</p>
                    <p className="font-bold text-lg flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Lv.{editedCharacter.level} - {getLevelTitle(editedCharacter.level)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">创作次数</p>
                    <p className="font-bold text-lg flex items-center gap-1">
                      <Zap className="h-4 w-4 text-blue-500" />
                      {editedCharacter.creationCount} 次
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>经验值进度</Label>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${Math.min((editedCharacter.experiencePoints % getNextLevelExp(editedCharacter.level)) / getNextLevelExp(editedCharacter.level) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {editedCharacter.experiencePoints % getNextLevelExp(editedCharacter.level)} / {getNextLevelExp(editedCharacter.level)} EXP
                </p>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">成长加成</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 等级越高，生成的剧情越精彩</li>
                  <li>• 每次创作都会获得经验值</li>
                  <li>• 特殊技能会影响故事风格</li>
                  <li>• 角色背景越丰富，故事越个性化</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1">
            保存角色
          </Button>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 