import { View } from 'react-native'
import Header from '../components/header'
import { colors } from '../../components/colors'
import Schedule from '../components/schedule'

export default function Home({ userData }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.light,
      gap: 15,
    }}>
      <Header />
      <Schedule
        role={userData?.role}
      />
    </View>
  )
}