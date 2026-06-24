'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getPlanInfo, canAccess, getDaysLeft, type PlanInfo, type Feature } from '@/lib/plans';

export function usePlan() {
  const [planInfo, setPlanInfo] = useState<PlanInfo>({ plan: 'free', trialEndsAt: null, isTrialExpired: false, isPro: false });
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data } = await supabase
        .from('therapeutes')
        .select('plan, trial_ends_at, subscription_status')
        .eq('id', session.user.id)
        .single();

      if (data) {
        let effectivePlan = data.plan || 'free';
        if (data.subscription_status === 'active' && (effectivePlan === 'founder' || effectivePlan === 'standard')) {
          // Keep paid plan
        } else if (effectivePlan === 'trial') {
          // Keep trial
        } else {
          effectivePlan = 'free';
        }
        setPlanInfo(getPlanInfo(effectivePlan, data.trial_ends_at));
        if (data.trial_ends_at) setHasUsedTrial(true);
      }
      setLoading(false);
    };
    fetchPlan();
  }, []);

  return {
    ...planInfo,
    loading,
    hasUsedTrial,
    canAccess: (feature: Feature) => canAccess(planInfo, feature),
    daysLeft: getDaysLeft(planInfo.trialEndsAt),
  };
}
