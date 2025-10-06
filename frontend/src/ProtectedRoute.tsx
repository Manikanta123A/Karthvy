// ProtectedRoute.tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios"; // or your axios instance
interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

interface User {
    _id: string;
    role: string;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:4000/authenticate", { withCredentials: true }); // send cookies
                setUser(res.data.user);
                
            } catch (err) {
                console.log(err)
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <p>Loading...</p>;

    // Not logged in
    if (!user) return <Navigate to="/login" replace />;

    
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

    return <>{children}</>;
}
