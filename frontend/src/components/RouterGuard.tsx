import { ReactNode } from "react";
import { useAuth } from "../contexts/auth.context";
import { Navigate } from "react-router";
import { useIsClient } from "../hooks/useAuth";

type ChildrenProps = {
    children: ReactNode
}

export function RequireAuth({ children }: ChildrenProps) {
    const { user, loading } = useAuth();
    if(loading) return <div className="p-8">Carregando...</div>
    if(!user) return <Navigate to="/login" replace />
    return <>{children}</>
}

export function RequireClient({ children }: ChildrenProps) {
    const { user, loading } = useAuth();
    if(loading) return <div className="p-8">Carregando...</div>
    if(!user) return <Navigate to="/login" replace />
    if(!useIsClient) return <Navigate to="/" replace />
    return <>{children}</>
}