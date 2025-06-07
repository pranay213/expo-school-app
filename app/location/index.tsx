import { View, Text, StatusBar, SafeAreaView } from 'react-native'
import React from 'react'
import Leaflet from '@/components/Leaflet'

const index = () => {
    return (
        <>
            <StatusBar hidden />
            <Leaflet />
        </>
    )
}

export default index