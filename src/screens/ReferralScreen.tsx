import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

interface ReferralScreenProps {
  onBack: () => void;
}

interface Stats {
  totalReferrals: number;
  totalEarnings: number;
  pendingPayments: number;
  paidCommissions: number;
  availableBalance: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_HEIGHT = 140;
const Y_TICKS = ['$4', '$3', '$2', '$1', '$0'];

export const ReferralScreen = ({ onBack }: ReferralScreenProps) => {
  const insets = useSafeAreaInsets();
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    paidCommissions: 0,
    availableBalance: 0,
  });
  const [shared, setShared] = useState(false);
  const sharedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (sharedTimeoutRef.current) clearTimeout(sharedTimeoutRef.current);
    };
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const code = user.id.replace(/-/g, '').substring(0, 8).toUpperCase();
    setReferralLink(`https://hustlingo.com/?ref=${code}`);

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', user.id);

    setStats(prev => ({ ...prev, totalReferrals: count ?? 0 }));
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join me on Hustlingo and start earning money online! ${referralLink}`,
        url: referralLink,
      });
    } catch (_) {}
  };

  const handleCopyLink = async () => {
    try {
      const result = await Share.share({ message: referralLink });
      if (result.action === Share.sharedAction) {
        setShared(true);
        sharedTimeoutRef.current = setTimeout(() => setShared(false), 2500);
      }
    } catch (_) {}
  };

  const handleWithdraw = () => {
    Alert.alert('Coming Soon', 'Withdrawals will be available soon!');
  };

  // Last 12 month labels ending at current month
  const currentMonth = new Date().getMonth();
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    MONTHS[(currentMonth - 11 + i + 12) % 12]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referrals</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2×2 Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Referrals"
            value={stats.totalReferrals.toString()}
            icon="people-outline"
            change="15.2% since last month"
          />
          <StatCard
            label="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon="cash-outline"
            change="18.2% since last month"
          />
          <StatCard
            label="Pending Payments"
            value={`$${stats.pendingPayments.toFixed(2)}`}
            icon="time-outline"
            change="8.4% since last week"
          />
          <StatCard
            label="Paid Commissions"
            value={`$${stats.paidCommissions.toFixed(2)}`}
            icon="wallet-outline"
            change="12.6% since last month"
          />
        </View>

        {/* Referral Link Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Referral Link</Text>
          <Text style={styles.cardSubtitle}>
            Share this link to earn commissions on referred users
          </Text>

          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
              {referralLink}
            </Text>
            <View style={styles.linkActions}>
              <TouchableOpacity onPress={handleShareLink} style={styles.iconBtn}>
                <Ionicons name="open-outline" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCopyLink}
                style={[styles.copyBtn, shared && styles.copyBtnDone]}
              >
                <Ionicons
                  name={shared ? 'checkmark' : 'copy-outline'}
                  size={14}
                  color={shared ? colors.accent : colors.text.primary}
                />
                <Text style={[styles.copyBtnText, shared && styles.copyBtnTextDone]}>
                  {shared ? 'Shared!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips Box */}
          <View style={styles.tipsBox}>
            <View style={styles.tipsHeader}>
              <Ionicons name="flash" size={14} color={colors.accent} />
              <Text style={styles.tipsTitle}>Tips to Boost Your Referrals</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Create content showing how you use our platform!</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Add your referral link to your social media bio!</Text>
            </View>
          </View>

          <Text style={styles.commissionText}>
            You earn{' '}
            <Text style={styles.commissionGreen}>20% commission</Text>
            {' '}every time your referral pays—
            <Text style={styles.commissionBold}>lifetime stacking!</Text>
          </Text>
        </View>

        {/* Available Balance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Balance</Text>
          <Text style={styles.cardSubtitle}>
            Your current earnings available for withdrawal
          </Text>

          <Text style={styles.balanceAmount}>${stats.availableBalance.toFixed(2)}</Text>
          <Text style={styles.balanceSub}>
            Total withdrawable: ${stats.availableBalance.toFixed(2)}
          </Text>

          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw} activeOpacity={0.8}>
            <Ionicons name="cash" size={18} color="#000" />
            <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
          </TouchableOpacity>

          <Text style={styles.withdrawNote}>
            Withdrawals are processed within 3-5 business days
          </Text>
        </View>

        {/* Commissions Chart Card */}
        <View style={styles.card}>
          <View style={styles.chartTitleRow}>
            <Ionicons name="trending-up" size={18} color={colors.accent} />
            <Text style={[styles.cardTitle, { marginLeft: 8, marginBottom: 0 }]}>
              Commissions Over Time
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { marginTop: 4 }]}>
            Your earnings history over the past 12 months
          </Text>
          <LineChart labels={monthLabels} />
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon,
  change,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  change: string;
}) => (
  <View style={styles.statCard}>
    <View style={styles.statCardTop}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statIconBadge}>
        <Ionicons name={icon} size={14} color={colors.accent} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statChange}>↑ {change}</Text>
  </View>
);

// ─── Line Chart ───────────────────────────────────────────────────────────────

const LineChart = ({ labels }: { labels: string[] }) => (
  <View style={chart.wrapper}>
    {/* Y labels + plot area side by side */}
    <View style={chart.body}>
      {/* Y-axis */}
      <View style={[chart.yAxis, { height: CHART_HEIGHT }]}>
        {Y_TICKS.map((tick) => (
          <Text key={tick} style={chart.yLabel}>{tick}</Text>
        ))}
      </View>

      {/* Plot area */}
      <View style={[chart.plotArea, { height: CHART_HEIGHT }]}>
        {/* Grid lines — evenly spaced from top ($4) to bottom ($0) */}
        {Y_TICKS.map((_, i) => (
          <View
            key={i}
            style={[
              chart.gridLine,
              {
                top: (i / (Y_TICKS.length - 1)) * (CHART_HEIGHT - 1),
                backgroundColor: i === Y_TICKS.length - 1
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(255,255,255,0.05)',
              },
            ]}
          />
        ))}

        {/* Green data line flat at bottom (all values $0) */}
        <View style={chart.dataLine} />
      </View>
    </View>

    {/* X-axis labels */}
    <View style={chart.xRow}>
      <View style={{ width: 30 }} />
      {labels.map((label, i) => (
        <Text key={i} style={chart.xLabel}>{label}</Text>
      ))}
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
    flex: 1,
    marginRight: 6,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(95,203,15,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.accent,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 18,
  },

  // Referral link box
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 14,
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  copyBtnDone: {
    borderColor: colors.accent,
  },
  copyBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
  },
  copyBtnTextDone: {
    color: colors.accent,
  },

  // Tips box
  tipsBox: {
    backgroundColor: 'rgba(95,203,15,0.07)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(95,203,15,0.2)',
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.primary,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 5,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    lineHeight: 18,
  },
  commissionText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    lineHeight: 20,
  },
  commissionGreen: {
    color: colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  commissionBold: {
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },

  // Available balance
  balanceAmount: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginVertical: 8,
  },
  balanceSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 30,
    paddingVertical: 16,
    marginBottom: 12,
  },
  withdrawBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  withdrawNote: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Chart title row
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
});

const chart = StyleSheet.create({
  wrapper: {
    marginTop: 16,
  },
  body: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  yLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.text.tertiary,
  },
  plotArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  dataLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  xRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  xLabel: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
