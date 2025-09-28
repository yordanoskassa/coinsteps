import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { api as apiClient } from '../services/apiClient';
import Avatar from '../components/Avatar';

interface WalletInfo {
  public_key: string;
  balance: number;
}

interface Transaction {
  sender_username: string;
  recipient_username: string;
  amount: number;
  transaction_signature: string;
  memo?: string;
  timestamp: string;
  status: string;
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [memo, setMemo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        apiClient.get('/wallet/info'),
        apiClient.get('/wallet/transactions')
      ]);
      
      setWalletInfo(walletResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error: any) {
      console.error('Failed to load wallet data:', error);
      if (error.response?.status === 404) {
        Alert.alert(
          'Setting Up Wallet... 🔧', 
          'Your wallet is being created automatically. Please refresh in a moment.',
          [{ text: 'Refresh Now', onPress: loadWalletData, style: 'default' }]
        );
      } else if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error 🔐', 
          'Please log out and log back in to refresh your session.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Connection Error 📡', 
          'Unable to connect to wallet service. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: loadWalletData, style: 'default' },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWalletData();
  };

  const requestAirdrop = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/wallet/airdrop', { amount: 1.0 });
      Alert.alert(
        'Airdrop Success! 🎉', 
        `1 SOL has been added to your wallet.\n\nTransaction: ${response.data.transaction_signature.slice(0, 8)}...`,
        [{ text: 'OK', style: 'default' }]
      );
      setTimeout(() => loadWalletData(), 2000); // Refresh after 2 seconds
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to request airdrop';
      
      // Show user-friendly error with helpful actions
      Alert.alert(
        'Airdrop Failed ❌',
        errorMessage,
        [
          { text: 'Try Again', onPress: () => requestAirdrop(), style: 'default' },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !recipientUsername) {
      Alert.alert('Missing Information ⚠️', 'Please fill in recipient username and amount');
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount ⚠️', 'Please enter a valid amount greater than 0');
      return;
    }

    if (walletInfo && amount > walletInfo.balance) {
      Alert.alert(
        'Insufficient Balance ❌', 
        `You need ${amount} SOL but only have ${walletInfo.balance.toFixed(4)} SOL.\n\nRequest an airdrop first?`,
        [
          { text: 'Request Airdrop', onPress: requestAirdrop, style: 'default' },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setIsTransferring(true);
      const response = await apiClient.post('/wallet/transfer', {
        recipient_username: recipientUsername,
        amount: amount,
        memo: memo || undefined
      });

      Alert.alert(
        'Transfer Success! 🎉', 
        `${amount} SOL sent to ${recipientUsername}\n\nTransaction: ${response.data.transaction_signature.slice(0, 8)}...`,
        [{ text: 'OK', style: 'default' }]
      );
      setTransferAmount('');
      setRecipientUsername('');
      setMemo('');
      loadWalletData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Transfer failed';
      
      Alert.alert(
        'Transfer Failed ❌',
        errorMessage,
        [
          { text: 'Try Again', onPress: () => handleTransfer(), style: 'default' },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading && !walletInfo) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, backgroundColor: colors.bg }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Solana Wallet</Text>
            <Text style={styles.subtitle}>Send SOL to friends</Text>
          </View>
          {user?.avatar_seed && <Avatar seed={user.avatar_seed} size={56} />}
        </View>

        {/* Wallet Balance Card */}
        {walletInfo && (
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Ionicons name="wallet" size={24} color={colors.primary} />
              <Text style={styles.balanceLabel}>SOL Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>{walletInfo.balance.toFixed(4)} SOL</Text>
            <Text style={styles.walletAddress}>
              {formatAddress(walletInfo.public_key)}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.airdropButton} onPress={requestAirdrop} disabled={isLoading}>
            <Ionicons name="cloud-download" size={20} color={colors.bg} />
            <Text style={styles.airdropButtonText}>Request Airdrop (1 SOL)</Text>
          </TouchableOpacity>
        </View>

        {/* Transfer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send SOL</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Recipient Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username..."
              placeholderTextColor={colors.textMuted}
              value={recipientUsername}
              onChangeText={setRecipientUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount (SOL)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Memo (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a note..."
              placeholderTextColor={colors.textMuted}
              value={memo}
              onChangeText={setMemo}
            />
          </View>

          <TouchableOpacity 
            style={[styles.transferButton, isTransferring && styles.transferButtonDisabled]} 
            onPress={handleTransfer}
            disabled={isTransferring}
          >
            {isTransferring ? (
              <ActivityIndicator size="small" color={colors.bg} />
            ) : (
              <Ionicons name="send" size={20} color={colors.bg} />
            )}
            <Text style={styles.transferButtonText}>
              {isTransferring ? 'Sending...' : 'Send SOL'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
            </View>
          ) : (
            transactions.map((tx, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Ionicons 
                    name={tx.sender_username === user?.username ? "arrow-up" : "arrow-down"} 
                    size={20} 
                    color={tx.sender_username === user?.username ? colors.error : colors.success} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {tx.sender_username === user?.username ? 'Sent to' : 'Received from'} {' '}
                    {tx.sender_username === user?.username ? tx.recipient_username : tx.sender_username}
                  </Text>
                  <Text style={styles.transactionDate}>{formatDate(tx.timestamp)}</Text>
                  {tx.memo && <Text style={styles.transactionMemo}>"{tx.memo}"</Text>}
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText,
                    { color: tx.sender_username === user?.username ? colors.error : colors.success }
                  ]}>
                    {tx.sender_username === user?.username ? '-' : '+'}{tx.amount} SOL
                  </Text>
                  <Text style={styles.transactionStatus}>{tx.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceAmount: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  walletAddress: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  actionsSection: {
    marginBottom: 24,
  },
  airdropButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  airdropButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
  },
  transferButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  transferButtonDisabled: {
    opacity: 0.6,
  },
  transferButtonText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  transactionMemo: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  transactionStatus: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
});
