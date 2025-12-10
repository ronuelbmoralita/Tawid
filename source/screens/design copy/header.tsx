import { View, Text, StatusBar, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import Icon from '../../components/icons';
import { colors } from '../../components/colors';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


export default function Header() {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: StatusBar.currentHeight,
      alignItems: 'center',
      marginHorizontal: 15,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}>
        <Image
          style={{
            height: 40,
            width: 40,
            borderRadius: 100,
          }}
          source={require('../../../assets/icon.png')}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />
        <Text style={{
          fontSize: 20,
          fontWeight: '900',
          color: colors.dark,
        }}>Tawid</Text>
      </View>
      <Icon style={{
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 100,
      }}
        name="bell"
        size={20}
        color={colors.light}
      />
    </View>
  )
}