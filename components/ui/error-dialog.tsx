"use client";

import { useState } from "react";
import { Copy, Mail, AlertTriangle, Bug, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ErrorDetails {
  status?: number;
  statusText?: string;
  url?: string;
  timestamp?: string;
  requestId?: string;
  response?: any;
  message?: string;
  errorCode?: string;
  originalError?: any;
}

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error: Error & { details?: ErrorDetails };
  context?: {
    action?: string;
    productId?: string;
    email?: string;
    userId?: string;
    productType?: string;
    creditsAmount?: number;
    discountCode?: string;
    environment?: Record<string, string>;
  };
}

export function ErrorDialog({ isOpen, onClose, error, context }: ErrorDialogProps) {
  const [copied, setCopied] = useState(false);

  const formatJsonWithHighlight = (obj: any) => {
    if (!obj) return "无数据";
    if (typeof obj === "string") return obj;
    
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const getErrorSeverity = (status?: number) => {
    if (!status) return "destructive";
    if (status >= 500) return "destructive";
    if (status >= 400) return "secondary";
    return "default";
  };

  const getStatusBadgeColor = (status?: number) => {
    if (!status) return "bg-gray-500";
    if (status >= 500) return "bg-red-500";
    if (status >= 400) return "bg-yellow-500";
    if (status >= 300) return "bg-blue-500";
    return "bg-green-500";
  };

  const errorData = {
    basic: {
      message: error.message,
      timestamp: error.details?.timestamp || new Date().toISOString(),
      requestId: error.details?.requestId,
      errorCode: error.details?.errorCode,
    },
    http: {
      status: error.details?.status,
      statusText: error.details?.statusText,
      url: error.details?.url,
    },
    response: error.details?.response,
    request: context ? {
      action: context.action,
      productId: context.productId,
      email: context.email,
      userId: context.userId,
      productType: context.productType,
      creditsAmount: context.creditsAmount,
      discountCode: context.discountCode,
    } : null,
    environment: context?.environment,
    stack: error.stack,
    originalError: error.details?.originalError
  };

  const fullErrorReport = {
    timestamp: new Date().toISOString(),
    error: errorData,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
  };

  const copyErrorDetails = async () => {
    try {
      const reportText = JSON.stringify(fullErrorReport, null, 2);
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const sendErrorReport = () => {
    const subject = `支付错误报告 - ${error.details?.errorCode || 'UNKNOWN'}`;
    const body = `错误详情：\n\n${JSON.stringify(fullErrorReport, null, 2)}`;
    const mailtoUrl = `mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle className="text-lg font-semibold">
              支付处理错误
            </DialogTitle>
            {error.details?.status && (
              <Badge 
                variant="secondary" 
                className={`${getStatusBadgeColor(error.details.status)} text-white`}
              >
                HTTP {error.details.status}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-sm text-gray-600">
            支付会话创建失败，以下是详细的错误信息和调试数据
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="request">请求信息</TabsTrigger>
            <TabsTrigger value="response">响应信息</TabsTrigger>
            <TabsTrigger value="environment">环境信息</TabsTrigger>
            <TabsTrigger value="debug">调试信息</TabsTrigger>
          </TabsList>

          <div className="mt-4 h-96">
            <TabsContent value="overview" className="h-full">
              <div className="h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">错误消息</label>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{error.message}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">错误代码</label>
                      <div className="p-3 bg-gray-50 border rounded-md">
                        <code className="text-sm font-mono">{error.details?.errorCode || 'UNKNOWN'}</code>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">请求ID</label>
                      <div className="p-3 bg-gray-50 border rounded-md">
                        <code className="text-sm font-mono">{error.details?.requestId || '无'}</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">时间戳</label>
                      <div className="p-3 bg-gray-50 border rounded-md">
                        <code className="text-sm">{error.details?.timestamp || '无'}</code>
                      </div>
                    </div>
                  </div>

                  {error.details?.url && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API端点</label>
                      <div className="p-3 bg-gray-50 border rounded-md">
                        <code className="text-sm break-all">{error.details.url}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="request" className="h-full">
              <div className="h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4" />
                    <h3 className="font-medium">请求参数</h3>
                  </div>
                  <Textarea
                    value={formatJsonWithHighlight(errorData.request)}
                    readOnly
                    className="font-mono text-xs min-h-[300px]"
                    placeholder="无请求数据"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="response" className="h-full">
              <div className="h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <h3 className="font-medium">API响应</h3>
                  </div>
                  
                  {error.details?.status && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">HTTP状态</label>
                        <Badge variant={getErrorSeverity(error.details.status)}>
                          {error.details.status} {error.details.statusText}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <Textarea
                    value={formatJsonWithHighlight(errorData.response)}
                    readOnly
                    className="font-mono text-xs min-h-[250px]"
                    placeholder="无响应数据"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="environment" className="h-full">
              <div className="h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4" />
                    <h3 className="font-medium">环境配置</h3>
                  </div>
                  <Textarea
                    value={formatJsonWithHighlight(errorData.environment)}
                    readOnly
                    className="font-mono text-xs min-h-[300px]"
                    placeholder="无环境数据"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="debug" className="h-full">
              <div className="h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4" />
                    <h3 className="font-medium">调试信息</h3>
                  </div>
                  <Textarea
                    value={error.stack || '无堆栈信息'}
                    readOnly
                    className="font-mono text-xs min-h-[200px]"
                  />
                  
                  {errorData.originalError && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">原始错误</label>
                      <Textarea
                        value={formatJsonWithHighlight(errorData.originalError)}
                        readOnly
                        className="font-mono text-xs min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyErrorDetails}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? "已复制!" : "复制完整报告"}
            </Button>
            <Button
              variant="outline"
              onClick={sendErrorReport}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              发送错误报告
            </Button>
          </div>
          <Button onClick={onClose} variant="default">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 