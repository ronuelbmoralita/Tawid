import * as React from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';
import { Header } from './ui/header';
import { Form } from './ui/form';
import { History } from './ui/history';
import { Card } from './ui/card';
import { Reply } from './ui/reply';
import { CategoryOption } from './reporterReplyFunc';

import {
  UserData,
  Category,
  FeedbackItem,
  CATEGORIES,
  subscribeToUserFeedback,
  submitFeedback,
  editFeedback,
  formatDate,
  isFeedbackClosed,
  getStatusLabel,
  getStatusColor,
  getCategoryIcon,
  validateFeedbackMessage,
  getCurrentUserId,
  isUserLoggedIn,
  showValidationErrorAlert,
  showLoginRequiredAlert,
  showFeedbackErrorAlert,
} from './reporterReplyFunc';

export default function ReporterReply({ userData }: { userData: UserData | null }) {
  // State — submit form
  const [category, setCategory] = React.useState<Category>('Suggestion');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [history, setHistory] = React.useState<FeedbackItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);

  // State — edit existing feedback
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editCategory, setEditCategory] = React.useState<Category>('Suggestion');
  const [editMessage, setEditMessage] = React.useState('');
  const [editSaving, setEditSaving] = React.useState(false);

  // ========== Effects ==========

  React.useEffect(() => {
    const uid = getCurrentUserId();
    if (!uid) {
      setHistoryLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserFeedback(
      uid,
      (items) => {
        setHistory(items);
        setHistoryLoading(false);
      },
      () => {
        setHistoryLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // ========== Submit Handlers ==========

  const handleSubmit = async () => {
    if (!validateFeedbackMessage(message)) {
      showValidationErrorAlert();
      return;
    }

    if (!isUserLoggedIn()) {
      showLoginRequiredAlert();
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback(category, message, userData);
      setMessage('');
      setCategory('Suggestion');
    } catch (error) {
      showFeedbackErrorAlert(error);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== Edit Handlers ==========

  const openEdit = (item: FeedbackItem) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingId(item.id);
    setEditCategory(item.category as Category);
    setEditMessage(item.message);
  };

  const cancelEdit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingId(null);
    setEditMessage('');
  };

  const saveEdit = async (item: FeedbackItem) => {
    if (!validateFeedbackMessage(editMessage)) {
      showValidationErrorAlert();
      return;
    }

    setEditSaving(true);
    try {
      await editFeedback(item, editCategory, editMessage);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setEditingId(null);
    } catch (error) {
      showFeedbackErrorAlert(error);
    } finally {
      setEditSaving(false);
    }
  };

  // ========== Render Helpers ==========

  const renderEditPanel = (item: FeedbackItem) => (
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
        EDIT FEEDBACK
      </Text>

      <Form
        categories={CATEGORIES as CategoryOption[]}
        selectedCategory={editCategory}
        onCategoryChange={(cat) => setEditCategory(cat as Category)}
        message={editMessage}
        onMessageChange={setEditMessage}
        onSubmit={() => saveEdit(item)}
        submitting={editSaving}
        submitLabel="Save Changes"
        submittingLabel="Saving..."
      />

      <TouchableOpacity
        onPress={cancelEdit}
        disabled={editSaving}
        style={{ marginTop: 10, alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 14 }}
      >
        <Text style={{ fontSize: 13, color: '#8A8A8E', fontWeight: '600' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHistoryItem = (item: FeedbackItem) => {
    const isClosed = isFeedbackClosed(item);
    const isEditing = editingId === item.id;

    return (
      <View key={item.id}>
        <Card
          id={item.id}
          name="You"
          date={formatDate(item.createdAt)}
          category={item.category}
          categoryIcon={getCategoryIcon(item.category)}
          message={item.message}
          status={item.status}
          statusLabel={getStatusLabel(item.status)}
          statusColor={getStatusColor(item.status)}
          isClosed={isClosed}
          showReplyHint={false}
          disabled={true}
          showEmail={false}
          // Walang pencil kapag closed na (may reply na) o kasalukuyang
          // nag-e-edit — server-side check pa rin ang totoong gate.
          onEditPress={isClosed || isEditing ? undefined : () => openEdit(item)}
        />

        {isEditing && renderEditPanel(item)}

        {!isEditing && item.reply && (
          <Reply
            reply={item.reply}
            repliedBy="Tawid Support"
            repliedAt={formatDate(item.repliedAt)}
            iconName="headset"
            badgeText="Official"
          />
        )}
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
          title="Feedback"
          subtitle="Found a bug, have a suggestion, or a complaint? Let us know."
        />

        <Form
          categories={CATEGORIES as CategoryOption[]}
          selectedCategory={category}
          onCategoryChange={(cat) => setCategory(cat as Category)}
          message={message}
          onMessageChange={setMessage}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Send Feedback"
          submittingLabel="Sending..."
          placeholder="Write your feedback here..."
          showCategoryLabel={true}
          showMessageLabel={true}
        />

        <History
          loading={historyLoading}
          emptyMessage="You haven't submitted any feedback yet."
          title="YOUR FEEDBACKS"
        >
          {history.map(renderHistoryItem)}
        </History>
      </ScrollView>
    </SafeAreaView>
  );
}