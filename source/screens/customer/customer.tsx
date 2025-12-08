import { ScrollView, View } from 'react-native'
import React from 'react'
import Header from '../design/header'
import { colors } from '../../components/colors'
import Search from '../design/search'
import Banner from '../design/banner'
import Schedule from '../design/schedule'

export default function Customer() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.light,
      //backgroundColor: colors.primary,
      gap: 15,
    }}>
      <Header />
      <Search />
      <Banner />
      <Schedule />
    </View>
  )
}