import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { PersonalPlanScreenData } from '../types';
import { QuestionnaireScreenWrapper } from '../components';
import { usePaywall } from '../../hooks';
import { supabase } from '../../lib/supabase';
import { useSuperwall } from 'expo-superwall';

interface Props {
  data: PersonalPlanScreenData;
  onContinue: () => void;
  onBack: () => void; // Usually disabled here but kept for interface consistency
  currentStep: number;
  totalSteps: number;
  /** Placement name for the paywall (defaults to 'onboarding_paywall') */
  paywallPlacement?: string;
}

export const PersonalPlanScreen: React.FC<Props> = ({
  data,
  onContinue,
  onBack,
  currentStep,
  totalSteps,
  paywallPlacement = 'onboarding_paywall_android',
}) => {
  const [percent, setPercent] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; // For review rotation
  const [isComplete, setIsComplete] = useState(false);
  const animationStartedRef = useRef(false); // Prevent animation from restarting
  const mountIdRef = useRef(Math.random().toString(36).substr(2, 9)); // Unique ID for this mount
  const renderCountRef = useRef(0);
  const superwall = useSuperwall();
  
  // Debug: Track renders vs remounts
  renderCountRef.current += 1;
  const wasAnimationStarted = animationStartedRef.current;

  const activatePremiumInSupabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('[PAYWALL] Purchased/restored but no Supabase session found');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          // We identify Superwall with the Supabase auth user id during sign-in.
          superwall_customer_id: session.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('[PAYWALL] Failed to activate premium in Supabase:', error);
        return false;
      }

      await superwall.setSubscriptionStatus({ status: 'ACTIVE' });
      console.log('[PAYWALL] Premium activated in Supabase for user:', session.user.id);
      return true;
    } catch (error) {
      console.error('[PAYWALL] Unexpected error activating premium:', error);
      return false;
    }
  };

  // Paywall hook - shows paywall when user completes the questionnaire
  const { showPaywall, isPresenting, state: paywallState } = usePaywall({
    placement: paywallPlacement,
    onPresent: () => {
      // Paywall presented
    },
    onDismiss: async (result) => {
      if (result.type === 'purchased' || result.type === 'restored') {
        const activated = await activatePremiumInSupabase();
        if (!activated) {
          Alert.alert(
            'Purchase detected, but account sync failed',
            'Please try again. We could not activate premium on your account.'
          );
          return;
        }
        onContinue();
      }
    },
    onSkip: (reason) => {
      // Let subscribed users through; block misconfigured placements.
      if (reason.type === 'UserIsSubscribed' || reason.type === 'feature_callback') {
        onContinue();
        return;
      }
      console.error('[PAYWALL] Skipped with non-subscribed reason:', reason.type);
      Alert.alert(
        'Paywall not available',
        'We could not verify subscription access. Please restart the app and try again.'
      );
    },
  });

  // Handle continue button press - show paywall
  const handleContinuePress = async () => {
    if (!isComplete) {
      return;
    }
    
    if (isPresenting) {
      return;
    }
    
    await showPaywall();
  };

  // Animation duration in ms
  const DURATION = 5000;
  const STEPS = 15; // Number of jumps

  useEffect(() => {
    // Prevent animation from running multiple times
    if (animationStartedRef.current) {
      return;
    }
    
    animationStartedRef.current = true;
    
    // Generate realistic variable step sizes that add up to 100
    // Smaller steps at the beginning, larger in the middle, smaller at the end
    const generateSteps = () => {
      const steps: number[] = [];
      let remaining = 100;
      
      for (let i = 0; i < STEPS - 1; i++) {
        // Vary step size: 1-8% range, with some randomness
        const minStep = i < 3 ? 1 : i > STEPS - 4 ? 2 : 3; // Smaller at start/end
        const maxStep = i < 3 ? 5 : i > STEPS - 4 ? 8 : 12; // Larger in middle
        const stepSize = Math.random() * (maxStep - minStep) + minStep;
        const step = Math.min(stepSize, remaining - (STEPS - i - 1)); // Ensure we don't overshoot
        steps.push(Math.max(1, Math.floor(step)));
        remaining -= steps[i];
      }
      // Last step takes whatever is left
      steps.push(Math.max(1, Math.floor(remaining)));
      
      return steps;
    };

    const stepSizes = generateSteps();
    const totalSteps = stepSizes.reduce((a, b) => a + b, 0);
    
    // Normalize to ensure it adds up to exactly 100
    const normalizedSteps = stepSizes.map(step => (step / totalSteps) * 100);
    
    let currentValue = 0;
    let stepIndex = 0;
    const stepInterval = DURATION / STEPS;

    const animateToValue = (targetValue: number) => {
      Animated.timing(progressAnim, {
        toValue: targetValue,
        duration: stepInterval,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    };

    const interval = setInterval(() => {
      if (stepIndex < normalizedSteps.length) {
        currentValue += normalizedSteps[stepIndex];
        currentValue = Math.min(currentValue, 100);
        stepIndex++;
        
        // Animate progress bar smoothly to new value
        animateToValue(currentValue);
        
        // Update percentage text instantly (jump)
        setPercent(Math.floor(currentValue));
        
        // Update phases based on progress
        const totalPhases = data.phases.length;
        if (totalPhases > 0) {
          const segment = 100 / totalPhases;
          const newIndex = Math.min(
            Math.floor(currentValue / segment),
            totalPhases - 1
          );
          setCurrentPhaseIndex(newIndex);
        }

        // Complete when reached 100%
        if (currentValue >= 100 || stepIndex >= normalizedSteps.length) {
          animateToValue(100);
          setPercent(100);
          setIsComplete(true);
          clearInterval(interval);
          // Don't auto-continue, let user click the button
        }
      }
    }, stepInterval);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Review rotation logic
  useEffect(() => {
    if (!data.reviews || data.reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Change review
        setCurrentReviewIndex((prev) => (prev + 1) % data.reviews.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [data.reviews]);

  const currentPhase = data.phases[currentPhaseIndex] || '';
  const currentReview = data.reviews && data.reviews[currentReviewIndex];

  return (
    <QuestionnaireScreenWrapper
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={handleContinuePress}
      continueDisabled={!isComplete || isPresenting}
      hideNavbar={true}
      hideButton={false}
    >
      <View style={styles.container}>
        
        <View style={styles.contentContainer}>
          <View style={styles.progressContainer}>
            <Text style={styles.percentText}>{percent}%</Text>
            <Text style={styles.title}>{data.title}</Text>
            
            <View style={styles.progressBarBg}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }) 
                  }
                ]} 
              >
                 <LinearGradient
                  colors={[colors.accent, colors.success]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ flex: 1, borderRadius: 10 }}
                />
              </Animated.View>
            </View>
            
            <Text style={styles.phaseText}>{currentPhase}</Text>
            
            {currentReview && (
              <>
                <View style={styles.divider} />
                <View style={styles.reviewsHeader}>
                  <Text style={styles.reviewsCount}>100k+ people</Text>
                  <Text style={styles.reviewsSubtext}>have chosen Hustlingo</Text>
                </View>
                
                <View style={styles.reviewContainer}>
                  <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                    <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {currentReview.image ? (
                    <Image source={currentReview.image} style={styles.reviewAvatar} />
                  ) : (
                    <View style={styles.reviewAvatarPlaceholder}>
                      <Text style={styles.avatarText}>{currentReview.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.reviewName}>{currentReview.name}</Text>
                    <View style={styles.starsRow}>
                      {[...Array(5)].map((_, i) => (
                        <Text key={i} style={styles.star}>
                          {i < currentReview.stars ? '★' : '☆'}
                        </Text>
                      ))}
                    </View>
                  </View>
                  {currentReview.timeAgo && (
                     <Text style={styles.timeAgo}>{currentReview.timeAgo}</Text>
                  )}
                </View>
                <Text style={styles.reviewText}>"{currentReview.text}"</Text>
                    </View>
                  </Animated.View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </QuestionnaireScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  percentText: {
    fontSize: 64,
    fontFamily: 'Inter_800ExtraBold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  phaseText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.surface,
    marginVertical: 16,
  },
  reviewContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  reviewsHeader: {
    alignItems: 'center',
  },
  reviewsCount: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.accent,
    marginBottom: 4,
  },
  reviewsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  reviewName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  star: {
    color: '#FFD700',
    fontSize: 12,
    marginRight: 2,
  },
  timeAgo: {
    marginLeft: 'auto',
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  reviewText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
