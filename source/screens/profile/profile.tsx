import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '../../App';

export default function Profile() {

    const { user } = useContext(AuthContext);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text>Profile</Text>

            {user && (
                <>
                    <Text>UID: {user.uid}</Text>
                    <Text>Email: {user.email}</Text>
                    <Text>Name: {user.displayName ?? 'No name'}</Text>
                </>
            )}
        </View>
    );
}


