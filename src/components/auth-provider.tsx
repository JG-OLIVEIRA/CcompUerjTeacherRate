
"use client"
import type { User } from "lucia";
import React, { createContext, useContext } from "react";

interface AuthContextType {
    user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export default function AuthProvider({
    user,
    children
}: {
    user: User | null,
    children: React.ReactNode
}) {
    return <AuthContext.Provider value={{ user }}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
