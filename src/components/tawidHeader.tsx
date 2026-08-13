import { View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { colors } from '../constants/colors';

interface TawidHeaderProps {
  userData?: any;
}

export default function TawidHeader({ userData }: TawidHeaderProps) {
  const userPhoto = userData?.photo ?? null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
      }}
    >
      <ExpoImage
        source={require('../../assets/tawid.svg')}
        style={{ width: 90, height: 25, borderRadius: 100 }}
        contentFit="contain"
      />
      {userPhoto ? (
        <ExpoImage
          source={{ uri: userPhoto }}
          style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.brand }}
          contentFit="cover"
        />
      ) : (
        <FontAwesome6 name="circle-user" size={30} color={colors.brand} iconStyle="solid" />
      )}
    </View>
  );
}