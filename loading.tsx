import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Modal, View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from './source/components/colors';

interface LoadingContextType {
    loading: boolean;
    showLoading: () => void;
    hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const loadingStartTime = useRef<number | null>(null);

    const showLoading = (): void => {
        loadingStartTime.current = Date.now();
        setLoading(true);
    };

    const hideLoading = (): void => {
        if (loadingStartTime.current) {
            const elapsedTime = Date.now() - loadingStartTime.current;
            const remainingTime = Math.max(0, 2000 - elapsedTime); // 5 seconds minimum

            setTimeout(() => {
                setLoading(false);
                loadingStartTime.current = null;
            }, remainingTime);
        } else {
            setLoading(false);
        }
    };

    return (
        <LoadingContext.Provider value={{ loading, showLoading, hideLoading }}>
            {children}
            <Modal
                transparent={true}
                visible={loading}
                animationType="fade"
                onRequestClose={() => { }}
            >
                <View style={styles.modalContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </Modal>
        </LoadingContext.Provider>
    );
};

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within LoadingProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingBox: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});