import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { CheckCircle, ArrowRight, CreditCard, Calendar, User, Package, Gift } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { SyncButton } from './sync-button';

// 支付成功页面内容组件
async function PaymentSuccessContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const checkoutId = params.checkout_id as string;
  const orderId = params.order_id as string;
  const customerId = params.customer_id as string;
  const subscriptionId = params.subscription_id as string;
  const productId = params.product_id as string;
  const signature = params.signature as string;

  console.log('💳 Payment Success 页面参数:', {
    checkoutId,
    orderId, 
    customerId,
    subscriptionId,
    productId
  });

  // 获取用户信息和订阅状态
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let subscription = null;
  let customerData = null;
  let hasSubscription = false;
  let isCreditsPayment = false;
  
  if (user) {
    console.log('👤 当前用户:', user.email, user.id);
    
    // 获取客户数据和订阅信息
    const { data: customer } = await supabase
      .from('customers')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('user_id', user.id)
      .single();
    
    customerData = customer;
    
    if (customer?.subscriptions?.length > 0) {
      subscription = customer.subscriptions[0];
      hasSubscription = true;
      console.log('✅ 已找到订阅:', subscription);
    } else {
      console.log('❌ 未找到订阅，需要同步');
    }

    // 检查是否为积分购买
    isCreditsPayment = productId === 'prod_MqcjVo0Bpx0rbYmHVlrh2';
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 自动同步订阅状态组件 - 仅对订阅类商品 */}
        {!isCreditsPayment && (
          <SyncButton 
            hasSubscription={hasSubscription}
            subscriptionId={subscriptionId || ''}
            customerId={customerId || ''}
            productId={productId || 'prod_2zG6xzCysT3tWDSCzN3FOJ'}
          />
        )}
        
        <div className="text-center">
          {/* 成功图标 */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          {/* 标题 */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            支付成功！
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {isCreditsPayment 
              ? '您的积分已充值到账，可以开始创作精彩内容了！'
              : '感谢您的订阅，您的账户正在激活中。'
            }
          </p>
        </div>

        {/* 支付详情卡片 */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">支付详情</h2>
          
          <div className="space-y-3 text-sm">
            {orderId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  订单号
                </span>
                <span className="font-mono text-foreground">{orderId}</span>
              </div>
            )}

            {checkoutId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">支付ID</span>
                <span className="font-mono text-foreground text-xs">{checkoutId}</span>
              </div>
            )}
            
            {subscriptionId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">订阅ID</span>
                <span className="font-mono text-foreground text-xs">{subscriptionId}</span>
              </div>
            )}
            
            {subscription && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    订阅状态
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {subscription.status === 'active' ? '已激活' : subscription.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">订阅周期</span>
                  <span className="text-foreground">
                    {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
            
            {customerData && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    邮箱
                  </span>
                  <span className="text-foreground">{customerData.email}</span>
                </div>
                
                {customerData.credits > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      积分余额
                    </span>
                    <span className="text-foreground font-medium text-green-600">{customerData.credits} 积分</span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                产品
              </span>
              <span className="text-foreground text-xs">
                {isCreditsPayment ? '3积分充值包' : '订阅服务'}
              </span>
            </div>

            {productId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">产品ID</span>
                <span className="font-mono text-foreground text-xs">{productId}</span>
              </div>
            )}
          </div>
        </div>

        {/* 特殊提示 - 积分购买 */}
        {isCreditsPayment && customerData?.credits && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">积分充值成功！</p>
                <p className="text-xs text-green-600">
                  您现在拥有 {customerData.credits} 积分，可以开始创建AI内容了。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 下一步操作 */}
        <div className="space-y-4">
          <a
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
          >
            {isCreditsPayment ? '开始创作' : '前往控制台'}
            <ArrowRight className="w-4 h-4" />
          </a>
          
          <a
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors"
          >
            返回首页
          </a>
        </div>

        {/* 帮助信息 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {isCreditsPayment 
              ? '积分可用于生成AI故事和内容，祝您创作愉快！'
              : '如有任何问题，请联系我们的客服团队。'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// 主页面组件
export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在处理支付结果...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  );
} 