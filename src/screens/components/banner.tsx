import { Image } from 'expo-image';
import React, { useRef } from 'react';
import { View, FlatList, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { colors } from '../../components/colors';

const { width } = Dimensions.get('window');

const BANNERS = [
  { id: '1', title: 'SUMMER SALE', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600' },
  { id: '2', title: 'NEW ARRIVALS', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600' },
  { id: '3', title: 'FREE SHIPPING', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600' },
  { id: '4', title: 'LIMITED OFFER', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600' },
  { id: '5', title: 'WEEKEND SPECIAL', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1600' },
];

const Banner = ({ searchQuery = '', role = 'Customer' }: { searchQuery?: string; role?: string }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  if (searchQuery.length > 0 || role === 'Admin') return null;

  const renderItem = ({ item }: { item: typeof BANNERS[0] }) => (
    <Image
      source={require('../../../assets/format.png')}
      style={{ width, height: 100 }}
      contentFit="contain"
    />
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={(item) => item.id}
        initialNumToRender={2}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 }}>
        {BANNERS.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const widthAnim = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
          const opacityAnim = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });

          return (
            <TouchableOpacity key={i} onPress={() => flatListRef.current?.scrollToIndex({ index: i })}>
              <Animated.View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primary, width: widthAnim, opacity: opacityAnim }} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default Banner;