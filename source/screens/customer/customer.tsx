import * as React from 'react';
import { Text, View } from 'react-native';
import {
    useNavigation,
} from '@react-navigation/native';
import { Button } from '@react-navigation/elements';

export function Customer() {
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
            <Text>Home Screen</Text>
            <Button onPress={() => navigation.navigate('Profile')}>
                Go to Profile
            </Button>
        </View>
    );
}