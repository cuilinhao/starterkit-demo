"use server";

import { createClient } from '@/utils/supabase/server';
import { createOrUpdateCustomer, createOrUpdateSubscription } from '@/utils/supabase/subscriptions';
import { redirect } from 'next/navigation';

export async function syncSubscriptionData(
  subscriptionId: string,
  customerId: string,
  productId: string
) {
  try {
    console.log('🔄 开始同步订阅数据...');
    console.log('参数:', { subscriptionId, customerId, productId });
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('用户未登录');
    }
    
    console.log('当前用户:', user.email, user.id);
    
    // 构造模拟的Creem数据
    const mockCustomerData = {
      id: customerId,
      email: user.email || '',
      name: user.email?.split('@')[0] || '',
      country: 'CN',
      object: 'customer' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      mode: 'test' as const
    };

    const mockSubscriptionData = {
      id: subscriptionId,
      status: 'active' as const,
      product: productId,
      customer: mockCustomerData,
      current_period_start_date: new Date().toISOString(),
      current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      canceled_at: null,
      metadata: {
        user_id: user.id
      },
      object: 'subscription' as const,
      collection_method: 'charge_automatically' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      mode: 'test' as const
    };
    
    // 创建或更新客户
    console.log('创建客户记录...');
    const dbCustomerId = await createOrUpdateCustomer(mockCustomerData, user.id);
    console.log('✅ 客户记录完成:', dbCustomerId);
    
    // 创建或更新订阅
    console.log('创建订阅记录...');
    const dbSubscriptionId = await createOrUpdateSubscription(mockSubscriptionData, dbCustomerId);
    console.log('✅ 订阅记录完成:', dbSubscriptionId);
    
    return {
      success: true,
      message: '订阅同步成功',
      customerId: dbCustomerId,
      subscriptionId: dbSubscriptionId
    };
    
  } catch (error: any) {
    console.error('❌ 同步失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function checkAndSyncSubscription(
  subscriptionId: string,
  customerId: string,
  productId: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: '用户未登录' };
    }
    
    // 检查是否已存在订阅
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('user_id', user.id)
      .single();
    
    // 如果已经有订阅，不需要同步
    if (existingCustomer?.subscriptions?.length > 0) {
      return { 
        success: true, 
        message: '订阅已存在',
        hasSubscription: true 
      };
    }
    
    // 没有订阅，开始同步
    const result = await syncSubscriptionData(subscriptionId, customerId, productId);
    return { ...result, hasSubscription: false };
    
  } catch (error: any) {
    console.error('检查订阅失败:', error);
    return { success: false, error: error.message };
  }
} 