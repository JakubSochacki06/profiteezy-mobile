import { useCallback, useState } from 'react';
import { usePlacement } from 'expo-superwall';

export type PaywallResult = 
  | { type: 'purchased' }
  | { type: 'restored' }
  | { type: 'declined' }
  | { type: 'error'; message: string };

interface UsePaywallOptions {
  /** Placement name configured in Superwall dashboard */
  placement?: string;
  /** Called when paywall is presented */
  onPresent?: () => void;
  /** Called when paywall is dismissed with result */
  onDismiss?: (result: PaywallResult) => void;
  /** Called when paywall is skipped (user already subscribed, holdout, etc.) */
  onSkip?: (reason: { type: string }) => void;
}

interface UsePaywallReturn {
  /** Whether the paywall is currently being shown */
  isPresenting: boolean;
  /** Show the paywall */
  showPaywall: () => Promise<void>;
  /** Current state of the paywall */
  state: 'idle' | 'presenting' | 'dismissed' | 'skipped' | 'error';
}

/**
 * Custom hook to present Superwall paywalls with a clean API.
 * 
 * @example
 * ```tsx
 * const { showPaywall, isPresenting } = usePaywall({
 *   placement: 'questionnaire_complete',
 *   onDismiss: (result) => {
 *     if (result.type === 'purchased') {
 *       navigateToHome();
 *     }
 *   },
 * });
 * ```
 */
export function usePaywall(options: UsePaywallOptions = {}): UsePaywallReturn {
  const { 
    placement = 'campaign_trigger',
    onPresent,
    onDismiss,
    onSkip,
  } = options;

  const [state, setState] = useState<'idle' | 'presenting' | 'dismissed' | 'skipped' | 'error'>('idle');

  const { registerPlacement } = usePlacement({
    onPresent: (paywallInfo) => {
      console.log('[usePaywall] ✅ Paywall PRESENTED:', paywallInfo.name);
      setState('presenting');
      onPresent?.();
    },
    onDismiss: (_paywallInfo, paywallResult) => {
      console.log('[usePaywall] 🚪 Paywall DISMISSED with result:', paywallResult.type);
      setState('dismissed');
      
      // Map Superwall result to our simplified result type
      let result: PaywallResult;
      
      switch (paywallResult.type) {
        case 'purchased':
          result = { type: 'purchased' };
          break;
        case 'restored':
          result = { type: 'restored' };
          break;
        case 'declined':
        default:
          result = { type: 'declined' };
          break;
      }
      
      onDismiss?.(result);
    },
    onSkip: (reason) => {
      console.log('[usePaywall] ⏭️  Paywall SKIPPED. Reason:', reason.type);
      console.log('[usePaywall] Skip reason details:', JSON.stringify(reason, null, 2));
      setState('skipped');
      onSkip?.({ type: reason.type });
    },
    onError: (error) => {
      console.error('[usePaywall] ❌ Paywall ERROR:', error);
      setState('error');
      onDismiss?.({ type: 'error', message: error });
    },
  });

  const showPaywall = useCallback(async () => {
    console.log('[usePaywall] 🎯 showPaywall called with placement:', placement);
    setState('presenting');
    
    try {
      console.log('[usePaywall] 📞 Calling registerPlacement...');
      await registerPlacement({
        placement,
        feature: () => {
          // User was allowed through without paywall (already subscribed or holdout)
          console.log('[usePaywall] 🎁 Feature callback executed - user allowed through without paywall');
          setState('skipped');
          onSkip?.({ type: 'feature_callback' });
        },
      });
      console.log('[usePaywall] ✅ registerPlacement completed');
    } catch (error) {
      console.error('[usePaywall] ❌ registerPlacement failed:', error);
      setState('error');
    }
  }, [registerPlacement, placement, onSkip]);

  return {
    isPresenting: state === 'presenting',
    showPaywall,
    state,
  };
}
