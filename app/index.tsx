import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
    const router = useRouter();

    useEffect(() => {
        // Ensure navigation happens after the app's root layout is mounted
        const timeout = setTimeout(() => {
            router.replace('/login');
        }, 0); // Slight delay to allow the root layout to mount

        // Cleanup timeout if the component unmounts
        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4f46e5" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
});
