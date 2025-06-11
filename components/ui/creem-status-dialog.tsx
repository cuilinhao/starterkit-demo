"use client"

import { useState } from "react"
import { AlertTriangle, ExternalLink, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface CreemStatusDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreemStatusDialog({ isOpen, onClose }: CreemStatusDialogProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const handleRecheck = async () => {
    setIsChecking(true)
    try {
      // 重新检查API状态
      const response = await fetch('/api/test-creem')
      const data = await response.json()
      setLastCheck(new Date())
      
      // 如果API正常，关闭对话框
      if (data.tests?.some((test: any) => test.success)) {
        onClose()
      }
    } catch (error) {
      console.error('检查失败:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const solutions = [
    {
      title: "1. 重新生成API Key",
      description: "登录Creem.io仪表盘生成新的API key",
      action: "打开Creem.io仪表盘",
      url: "https://dashboard.creem.io",
      priority: "high"
    },
    {
      title: "2. 检查账户状态", 
      description: "确认账户没有被暂停，余额充足",
      action: "查看账户状态",
      url: "https://dashboard.creem.io/billing",
      priority: "medium"
    },
    {
      title: "3. 验证产品配置",
      description: "确认产品ID存在且配置正确",
      action: "管理产品",
      url: "https://dashboard.creem.io/products",
      priority: "medium"
    },
    {
      title: "4. 联系支持",
      description: "如果问题仍然存在，联系Creem.io技术支持",
      action: "联系支持",
      url: "https://docs.creem.io/support",
      priority: "low"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Creem.io API 连接问题
          </DialogTitle>
          <DialogDescription>
            支付API认证失败。我们检测到API返回401未授权错误，这通常意味着API key已过期或账户存在问题。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 错误状态 */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-800">API认证失败</span>
              <Badge variant="destructive">401 Unauthorized</Badge>
            </div>
            <p className="text-sm text-red-700">
              所有Creem.io API调用都返回401错误，表示API key无效或已过期。
            </p>
          </div>

          {/* 解决方案 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">解决方案</h3>
            
            {solutions.map((solution, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{solution.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(solution.priority)}
                      >
                        {solution.priority === 'high' ? '高优先级' : 
                         solution.priority === 'medium' ? '中优先级' : '低优先级'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{solution.description}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(solution.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {solution.action}
                </Button>
              </div>
            ))}
          </div>

          {/* 重新检查 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">重新检查API状态</p>
                <p className="text-xs text-gray-500">
                  {lastCheck ? `上次检查: ${lastCheck.toLocaleTimeString()}` : '尚未检查'}
                </p>
              </div>
              <Button 
                onClick={handleRecheck}
                disabled={isChecking}
                size="sm"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    检查中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    重新检查
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            稍后处理
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 