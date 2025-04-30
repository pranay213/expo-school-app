import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_REQUEST_AUTH_TOKEN } from '@/constants/variables'

const AuthGaurd = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    const checkAuthentication = useCallback(async () => {
        const token = await AsyncStorage.getItem(API_REQUEST_AUTH_TOKEN)
        if (isAuthenticated || token) {
            return router.push('/location')
        }
        setIsLoading(false) // Stop the loading spinner once done
    }, [isAuthenticated])

    useEffect(() => {
        checkAuthentication()
    }, [isAuthenticated])

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    return children
}

export default AuthGaurd
