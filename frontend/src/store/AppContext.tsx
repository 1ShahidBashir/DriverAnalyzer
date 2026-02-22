import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getFeatureFlags as fetchFlags } from '../services/api';

export interface FeatureFlags {
    driverFeedback: boolean;
    tripFeedback: boolean;
    appFeedback: boolean;
    marshalFeedback: boolean;
}

export interface AuthState {
    token: string | null;
    username: string | null;
    isAuthenticated: boolean;
}

interface AppContextType {
    featureFlags: FeatureFlags;
    setFeatureFlags: React.Dispatch<React.SetStateAction<FeatureFlags>>;
    flagsLoading: boolean;
    auth: AuthState;
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const defaultFlags: FeatureFlags = {
    driverFeedback: true,
    tripFeedback: true,
    appFeedback: false,
    marshalFeedback: true,
};

const stored = localStorage.getItem('adminToken');

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(defaultFlags);
    const [flagsLoading, setFlagsLoading] = useState(true);
    const [auth, setAuth] = useState<AuthState>({
        token: stored,
        username: stored ? 'admin' : null,
        isAuthenticated: !!stored,
    });

    useEffect(() => {
        fetchFlags()
            .then((res) => setFeatureFlags(res.data.data))
            .catch(() => { })
            .finally(() => setFlagsLoading(false));
    }, []);

    return (
        <AppContext.Provider value={{ featureFlags, setFeatureFlags, flagsLoading, auth, setAuth }}>
            {children}
        </AppContext.Provider>
    );
}

export const useFeatureFlags = () => {
    const { featureFlags, setFeatureFlags, flagsLoading } = useContext(AppContext);
    return { featureFlags, setFeatureFlags, loading: flagsLoading };
};

export const useAuth = () => {
    const { auth, setAuth } = useContext(AppContext);
    return { auth, setAuth };
};
