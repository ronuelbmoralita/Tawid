// PassengerHome.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../components/colors';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome6 } from '@expo/vector-icons';
import Header from '../design/header';
import SearchBar from '../design/search';
import PromotionBanner from '../design/banner';
import ScheduleList from '../design/schedule';

export default function PassengerHome() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Boats', icon: 'ship' },
    { id: 'available', label: 'Available', icon: 'check' },
    { id: 'departing', label: 'Departing Soon', icon: 'clock' },
    { id: 'cheap', label: 'Lowest Price', icon: 'money-bill-wave' },
  ];

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
    // Navigate to notifications screen
  };

  const handleFilterPress = (filterId: string) => {
    setActiveFilter(filterId);
    // Apply filter logic here
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Header onNotificationPress={handleNotificationPress} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Good morning! ⚓</Text>
          <Text style={styles.subGreeting}>Where would you like to sail today?</Text>
        </View>

        {/* Search Section */}
        <SearchBar />

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.activeFilterButton,
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <FontAwesome6 
                name={filter.icon} 
                size={16} 
                color={activeFilter === filter.id ? colors.white : colors.medium}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.id && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promotion Banner */}
        <PromotionBanner />

        {/* Schedules Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleContainer}>
            <FontAwesome6 name="ship" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Boat Schedules</Text>
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
            <FontAwesome6 name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Schedules List */}
        <ScheduleList />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.medium,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    color: colors.medium,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});