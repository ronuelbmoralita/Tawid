import { View } from 'react-native'
import React, { useState } from 'react'
import Header from '../design/header'
import { colors } from '../../components/colors'
import Search, { FilterState } from '../design/search'
import Banner from '../design/banner'
import Schedule from '../design/schedule'

export default function Customer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    boatTypes: [],
    statuses: [],
    priceRange: { min: 0, max: 1000 },
    days: []
  });

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.light,
      gap: 15,
    }}>
      <Header />
      <Search 
        onSearchChange={setSearchQuery}
        onFilterChange={setFilters}
      />
      <Banner searchQuery={searchQuery} role={'Admin'} />
      <Schedule 
        role={'Admin'} 
        searchQuery={searchQuery}
        filters={filters}
      />
    </View>
  )
}