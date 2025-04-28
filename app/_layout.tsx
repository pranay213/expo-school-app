import { store } from '@/redux/store';
import React from 'react';
import { View, StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';

type LayoutProps = {
    children: React.ReactNode;
};

const _layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <SafeAreaView style={styles.container}>
            <Provider store={store}>
                <StatusBar barStyle="dark-content" hidden />
                {children}
            </Provider>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Set a default background color for the layout
    },
});

export default _layout;
