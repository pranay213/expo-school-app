// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from '@/redux/store';
import GlobalLoader from '@/components/loader/loader';

export default function Layout() {
    return (
        <SafeAreaView style={styles.container}>
            <Provider store={store}>
                <GlobalLoader />
                <Slot />
            </Provider>
            {/* Toast should be outside Slot */}
            <Toast position="bottom" bottomOffset={60} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
