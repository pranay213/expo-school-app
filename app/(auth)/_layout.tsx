import React from 'react';
import { Slot } from 'expo-router';
import AuthGaurd from '@/gaurds/auth-gaurd';

const Layout = () => {
    return (
        <AuthGaurd>
            <Slot />
        </AuthGaurd>
    );
};

export default Layout;
