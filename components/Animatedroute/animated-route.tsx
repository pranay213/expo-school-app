import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Animated, Easing } from 'react-native';

const RouteLoadingOverlay = ({ visible }: { visible?: boolean }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Fade in
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.2,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            // Fade out
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
                opacity,
            }}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </Animated.View>
        </Animated.View>
    );
};

export default RouteLoadingOverlay;
