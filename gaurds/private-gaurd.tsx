import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_REQUEST_AUTH_TOKEN, API_REQUEST_AUTH } from '@/constants/variables'
import { initialize, setAuth } from '@/redux/slices/authSlice'

const AuthGaurd = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const dispatch: any = useDispatch()

    const checkAuthentication = useCallback(async () => {
        const token: any = await AsyncStorage.getItem(API_REQUEST_AUTH_TOKEN)
        if (isAuthenticated || token) {
            const user = await AsyncStorage.getItem(API_REQUEST_AUTH)
            dispatch(initialize({ token, user: JSON.parse(user || '{}') }))
            setIsLoading(false)

        }
        else router.push('/login')

    }, [isAuthenticated])

    useEffect(() => {
        checkAuthentication()
    }, [isAuthenticated])

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ff0000" />
            </View>
        )
    }

    return children
}

export default AuthGaurd
