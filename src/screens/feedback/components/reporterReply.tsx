import * as React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  // State
  const [category, setCategory] = React.useState<Category>('Suggestion');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [history, setHistory] = React.useState<FeedbackItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);

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

  // ========== Handlers ==========

  const handleSubmit = async () => {
    // Validate
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
      
      // Reset form
      setMessage('');
      setCategory('Suggestion');
    } catch (error) {
      showFeedbackErrorAlert(error);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== Render Helpers ==========

  const renderHistoryItem = (item: FeedbackItem) => {
    const isClosed = isFeedbackClosed(item);

    return (
      <View key={item.id}>
        {/* Original Feedback Card */}
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
        />

        {/* Company Reply */}
        {item.reply && (
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
        {/* Header */}
        <Header
          icon="comment-dots"
          title="Feedback"
          subtitle="Found a bug, have a suggestion, or a complaint? Let us know."
        />

        {/* Form */}
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

        {/* History */}
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