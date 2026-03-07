import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<Props> = ({ visible, onClose }) => {
  const [referralLink, setReferralLink] = useState('');
  const [friendCount, setFriendCount] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) loadData();
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, [visible]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const code = user.id.replace(/-/g, '').substring(0, 8).toUpperCase();
    setReferralLink(`https://hustlingo.com/?ref=${code}`);
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', user.id);
    setFriendCount(count ?? 0);
  };

  const handleCopyLink = async () => {
    try {
      const result = await Share.share({ message: referralLink });
      if (result.action === Share.sharedAction) {
        setLinkCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setLinkCopied(false), 2500);
      }
    } catch (_) {}
  };

  const handleShareWhatsApp = async () => {
    const msg = `Join me on Hustlingo and start earning online! ${referralLink}`;
    const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message: msg });
      }
    } catch (_) {
      await Share.share({ message: msg });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Hustlingo and start earning online! ${referralLink}`,
        url: referralLink,
      });
    } catch (_) {}
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Friends</Text>

          <Image source={require('../../assets/present.png')} style={styles.giftIcon} />

          <Text style={styles.heading}>
            Get 2 weeks of Hustlingo Pro for you and for each friend that joins!
          </Text>
          <Text style={styles.subtitle}>
            Learning is more fun and effective when you connect with friends
          </Text>

          {/* Share link */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share your link</Text>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                {referralLink}
              </Text>
              <TouchableOpacity onPress={handleCopyLink} style={styles.copyBtn}>
                <Ionicons
                  name={linkCopied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={linkCopied ? colors.accent : colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.shareRow}>
              <TouchableOpacity style={styles.whatsappBtn} onPress={handleShareWhatsApp} activeOpacity={0.8}>
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <Text style={styles.shareBtnText}>Whatsapp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Your invites */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your invites</Text>
            <View style={styles.inviteRow}>
              <View style={styles.inviteRowLeft}>
                <Ionicons name="person-outline" size={18} color={colors.text.secondary} />
                <Text style={styles.inviteRowText}>Accepted invitations</Text>
              </View>
              <Text style={styles.inviteRowCount}>{friendCount}</Text>
            </View>
            <View style={[styles.inviteRow, { borderBottomWidth: 0 }]}>
              <View style={styles.inviteRowLeft}>
                <Ionicons name="trophy-outline" size={18} color={colors.text.secondary} />
                <Text style={styles.inviteRowText}>Weeks of Hustlingo Pro</Text>
              </View>
              <Text style={styles.inviteRowCount}>{friendCount * 2}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    marginBottom: 24,
  },
  giftIcon: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.secondary,
    marginBottom: 12,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.text.secondary,
  },
  copyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  shareBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  inviteRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteRowText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.text.primary,
  },
  inviteRowCount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: colors.text.secondary,
  },
});
