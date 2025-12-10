import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from '../../components/icons';
import { colors } from '../../components/colors';

export default function Search() {

  const [text, onChangeText] = React.useState('');

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 15,
    }}>
      <TextInput
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: 100,
          paddingHorizontal: 20,
          elevation: 5,
          height: 60,
        }}
        placeholder='Search...'
        placeholderTextColor={colors.primary}
        onChangeText={onChangeText}
        value={text}
      />
      <Icon style={{
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderRadius: 100,
      }}
        name="sliders"
        size={20}
        color={colors.primary}
        onPress={() => {
          console.log('Hello')
        }} />
    </View>
  )
}