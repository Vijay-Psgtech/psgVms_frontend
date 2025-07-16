import { createContext, useContext, useState } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children })=>{
    const [admin,setAdmin] = useState({
        token: localStorage.getItem('token'),
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
        id: localStorage.getItem('id'),
    });

    const login = (token, name, email, id, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('name', name);
        localStorage.setItem('email', email);
        localStorage.setItem('id', id);
        localStorage.setItem('role', role);
        setAdmin({ token, name, email, id, role});
    };

    const logout = () => {
        localStorage.clear();
        setAdmin({ token: null, name: null, email: null, id: null, role: null});
    };

    return(
        <AuthContext.Provider value={{ admin, login, logout}}>
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);