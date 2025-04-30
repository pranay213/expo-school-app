// components/GlobalLoader.tsx
import { RootState } from '@/redux/store';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

const GlobalLoader = () => {
    const isLoading = useSelector((state: RootState) => state.loader.isLoading);

    if (!isLoading) return null;

    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#4f46e5" />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

export default GlobalLoader;
