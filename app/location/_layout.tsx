import React from 'react';
import { Slot } from 'expo-router';
import PrivateGuard from '@/gaurds/private-gaurd';

const Layout = () => {
    return (
        <PrivateGuard>
            <Slot />
        </PrivateGuard>

    );
};

export default Layout;
