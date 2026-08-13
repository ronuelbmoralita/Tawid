import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';

import ReporterReply from './components/reporterReply';
import CompanyReply from './components/companyReply';

interface UserData {
  name?: string;
  email?: string;
  role?: string;
  roleDual?: string;
}

export default function Feedback({ userData }: { userData: UserData | null }) {

  const isCompanyOwner = userData?.role === 'Company';

  // Optional: loading state while userData is still resolving
  if (userData === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (isCompanyOwner) {
    return <CompanyReply userData={userData} />;
  }

  return <ReporterReply userData={userData} />;
}