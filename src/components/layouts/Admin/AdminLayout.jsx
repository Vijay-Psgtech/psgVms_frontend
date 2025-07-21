import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";
import socket from "../../../utils/socket";
import { toast } from "react-toastify";

const AdminLayout = ({ admin }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useEffect(()=>{
        socket.on('new-visitor', (visitor) => {
            toast.info(`${visitor.name} has registered at the gate.`);
        });
        return () => socket.off('new-visitor');
    },[]);
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-1">
                <Topbar admin={admin} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout;