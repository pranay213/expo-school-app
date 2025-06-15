import { View, Text, StatusBar, SafeAreaView } from 'react-native'
import React from 'react'
import OlaMapsView from '@/components/OlaMapVIew'

const index = () => {
    return (
        <>
            <StatusBar hidden />
            <OlaMapsView />
        </>
    )
}

export default index