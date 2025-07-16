import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function PrivateRoute({ children }){
    const { admin } = useAuth();

    if(!admin.token){
        // Not logged in redirect to login
        return <Navigate to="/login" replace />;
    }

    // if(admin.role !== 'admin'){
    //     toast.error('Access Denied');
    //     return <Navigate to="/login" replace/>;
    // }

    return children
}