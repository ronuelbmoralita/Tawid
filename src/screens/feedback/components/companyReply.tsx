import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
  LayoutAnimation,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../../constants/colors';
import { Header } from './ui/header';
import { Card } from './ui/card';
import { Reply } from './ui/reply';
import { EmptyState } from './ui/emptyState';
import { Filter } from './ui/filter';
import { FilterOption } from './ui/filter';

import {
  UserData,
  FeedbackItem,
  FilterType,
  subscribeToFeedback,
  filterFeedbacks,
  getFilterCount,
  getFilterLabel,
  formatDate,
  isFeedbackClosed,
  markFeedbackAsViewed,
  sendReply,
  editReply,
  validateReplyText,
  showReplyErrorAlert,
  getStatusLabel,
  getStatusColor,
  getCategoryIcon,
  FILTER_OPTIONS,
} from './companyReplyFunc';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

export default function CompanyReply({ userData }: { userData: UserData | null }) {
  // State — feedback list + reply
  const [feedbacks, setFeedbacks] = React.useState<FeedbackItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // State — edit sent reply
  const [editingReplyId, setEditingReplyId] = React.useState<string | null>(null);
  const [editReplyText, setEditReplyText] = React.useState('');
  const [editSaving, setEditSaving] = React.useState(false);

  // ========== Effects ==========

  React.useEffect(() => {
    const unsubscribe = subscribeToFeedback(
      (items) => {
        setFeedbacks(items);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // ========== Computed Values ==========

  const filtered = React.useMemo(() => {
    return filterFeedbacks(feedbacks, filter);
  }, [feedbacks, filter]);

  const filterOptions: FilterOption[] = FILTER_OPTIONS.map((key) => ({
    key,
    label: getFilterLabel(key),
    count: getFilterCount(feedbacks, key),
  }));

  // ========== Reply Handlers ==========

  const openInlineReply = async (item: FeedbackItem) => {
    if (isFeedbackClosed(item)) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveReplyId(item.id);
    setReplyText('');

    try {
      await markFeedbackAsViewed(item);
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const cancelInlineReply = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveReplyId(null);
    setReplyText('');
  };

  const handleSendReply = async (item: FeedbackItem) => {
    if (!validateReplyText(replyText)) {
      Alert.alert('Empty Reply', 'Please write a reply before sending.');
      return;
    }

    setSaving(true);
    try {
      await sendReply(item, replyText, userData);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveReplyId(null);
      setReplyText('');
    } catch (error) {
      showReplyErrorAlert(error);
    } finally {
      setSaving(false);
    }
  };

  // ========== Edit Reply Handlers ==========

  const openEditReply = (item: FeedbackItem) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingReplyId(item.id);
    setEditReplyText(item.reply ?? '');
  };

  const cancelEditReply = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingReplyId(null);
    setEditReplyText('');
  };

  const handleSaveEditReply = async (item: FeedbackItem) => {
    if (!validateReplyText(editReplyText)) {
      Alert.alert('Empty Reply', 'Please write a reply before saving.');
      return;
    }

    setEditSaving(true);
    try {
      await editReply(item, editReplyText);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEditingReplyId(null);
      setEditReplyText('');
    } catch (error) {
      showReplyErrorAlert(error);
    } finally {
      setEditSaving(false);
    }
  };

  // ========== Render Helpers ==========

  const renderReplyInput = (item: FeedbackItem) => {
    return (
      <View
        style={{
          marginTop: 8,
          marginLeft: 12,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: colors.brand,
          padding: 14,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#8A8A8E',
            marginBottom: 8,
            letterSpacing: 0.3,
          }}
        >
          YOUR REPLY
        </Text>

        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Write your reply..."
          placeholderTextColor="#B0B0B5"
          multiline
          autoFocus
          textAlignVertical="top"
          style={{
            minHeight: 90,
            maxHeight: 180,
            fontSize: 15,
            lineHeight: 21,
            color: '#1A1A1A',
            padding: 0,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 10,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#F0F0F2',
          }}
        >
          <TouchableOpacity
            onPress={cancelInlineReply}
            disabled={saving}
            style={{ paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 14, color: '#8A8A8E', fontWeight: '600' }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSendReply(item)}
            disabled={saving || !replyText.trim()}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.brand,
              borderRadius: 10,
              paddingHorizontal: 18,
              paddingVertical: 9,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: saving || !replyText.trim() ? 0.5 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <FontAwesome6 name="paper-plane" size={13} color="#FFFFFF" iconStyle="solid" />
            )}
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
              {saving ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEditReplyInput = (item: FeedbackItem) => {
    return (
      <View
        style={{
          marginTop: 8,
          marginLeft: 12,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: colors.brand,
          padding: 14,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#8A8A8E',
            marginBottom: 8,
            letterSpacing: 0.3,
          }}
        >
          EDIT REPLY
        </Text>

        <TextInput
          value={editReplyText}
          onChangeText={setEditReplyText}
          placeholder="Write your reply..."
          placeholderTextColor="#B0B0B5"
          multiline
          autoFocus
          textAlignVertical="top"
          style={{
            minHeight: 90,
            maxHeight: 180,
            fontSize: 15,
            lineHeight: 21,
            color: '#1A1A1A',
            padding: 0,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 10,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#F0F0F2',
          }}
        >
          <TouchableOpacity
            onPress={cancelEditReply}
            disabled={editSaving}
            style={{ paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 14, color: '#8A8A8E', fontWeight: '600' }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSaveEditReply(item)}
            disabled={editSaving || !editReplyText.trim()}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.brand,
              borderRadius: 10,
              paddingHorizontal: 18,
              paddingVertical: 9,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: editSaving || !editReplyText.trim() ? 0.5 : 1,
            }}
          >
            {editSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <FontAwesome6 name="check" size={13} color="#FFFFFF" iconStyle="solid" />
            )}
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
              {editSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFeedbackItem = (item: FeedbackItem) => {
    const isClosed = isFeedbackClosed(item);
    const isReplying = activeReplyId === item.id;
    const isEditingReply = editingReplyId === item.id;

    return (
      <View key={item.id}>
        <Card
          id={item.id}
          name={item.name || 'Anonymous'}
          email={item.email}
          date={formatDate(item.createdAt)}
          category={item.category}
          categoryIcon={getCategoryIcon(item.category)}
          message={item.message}
          status={item.status}
          statusLabel={getStatusLabel(item.status)}
          statusColor={getStatusColor(item.status)}
          isClosed={isClosed}
          isReplying={isReplying}
          onPress={() => {
            if (!isClosed && !isReplying) {
              openInlineReply(item);
            }
          }}
          showReplyHint={true}
          disabled={isClosed || isReplying}
          showEmail={true}
        />

        {isReplying && renderReplyInput(item)}

        {item.reply && !isEditingReply && (
          <Reply
            reply={item.reply}
            repliedBy={item.repliedBy || 'Team'}
            repliedAt={formatDate(item.repliedAt)}
            iconName="building"
            badgeText="Author"
            onEditPress={() => openEditReply(item)}
          />
        )}

        {isEditingReply && renderEditReplyInput(item)}
      </View>
    );
  };

  // ========== Main Render ==========

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          icon="comment-dots"
          title="Feedback Inbox"
          subtitle="Manage and reply to user feedbacks"
        />

        <Filter
          options={filterOptions}
          activeFilter={filter}
          onFilterChange={(key) => setFilter(key as FilterType)}
        />

        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 30 }} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="inbox"
            message="No feedbacks found."
          />
        ) : (
          <View style={{ gap: 16 }}>
            {filtered.map(renderFeedbackItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}