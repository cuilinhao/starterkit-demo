"use client";

import { useState, useEffect } from 'react';
import { checkAndSyncSubscription } from './actions';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface SyncButtonProps {
  subscriptionId: string;
  customerId: string;
  productId: string;
  hasSubscription: boolean;
}

export function SyncButton({ subscriptionId, customerId, productId, hasSubscription }: SyncButtonProps) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [autoSynced, setAutoSynced] = useState(false);

  useEffect(() => {
    // 如果已经有订阅，不需要同步
    if (hasSubscription) {
      return;
    }

    // 如果缺少必要参数，不同步
    if (!subscriptionId || !customerId || !productId) {
      return;
    }

    // 自动同步一次
    if (!autoSynced) {
      setAutoSynced(true);
      setTimeout(() => {
        handleSync();
      }, 2000); // 延迟2秒，让用户看到成功页面
    }
  }, [hasSubscription, subscriptionId, customerId, productId, autoSynced]);

  const handleSync = async () => {
    setSyncStatus('syncing');
    setMessage('正在同步订阅状态...');

    try {
      const result = await checkAndSyncSubscription(subscriptionId, customerId, productId);
      
      if (result.success) {
        setSyncStatus('success');
        setMessage(result.message || '订阅同步成功！');
        
        // 成功后延迟刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSyncStatus('error');
        setMessage(result.error || '同步失败');
      }
    } catch (error: any) {
      setSyncStatus('error');
      setMessage(`同步失败: ${error.message}`);
    }
  };

  // 如果已经有订阅，不显示
  if (hasSubscription) {
    return null;
  }

  // 空闲状态不显示
  if (syncStatus === 'idle') {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        {syncStatus === 'syncing' && (
          <>
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-800">正在同步订阅状态</p>
              <p className="text-xs text-blue-600">请稍候，正在为您激活订阅...</p>
            </div>
          </>
        )}
        
        {syncStatus === 'success' && (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{message}</p>
              <p className="text-xs text-green-600">页面即将刷新显示最新状态</p>
            </div>
          </>
        )}
        
        {syncStatus === 'error' && (
          <>
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">同步失败</p>
              <p className="text-xs text-red-600">{message}</p>
              <button 
                onClick={handleSync}
                className="text-xs text-red-700 underline hover:no-underline mt-1 block"
              >
                点击重试
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 