import React,{useEffect, useState} from 'react'
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axiosInstance';
import { UserPlus } from 'lucide-react';

const AdminHostAdd = () => {
    const [form, setForm] = useState({name: '', email: '', phone: '', department: ''});
    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            const res = await axiosInstance.post('/api/host/addHost', form);
            if(res.data.success){
                setForm({name: '', email: '', phone: '', department: ''});
                toast.success(res.data.message);
            }else{
                toast.error("Failed to save..")
            }
            
        }catch(error){
            toast.error(error);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <div className='bg-white rounded-lg shadow-md p-8 md:p-12 w-full max-w-md mx-auto'>
                <div className='flex flex-col items-center md-6'>
                    <div className='bg-blue-100 p-3 rounded-full mb-2'>
                        <UserPlus className='text-blue-700' size={40} />
                    </div>
                    <h2 className='text-xl font-semibold text-gray-800'>Host Add</h2>    
                </div>
                <form onSubmit={handleSubmit} className='py-6 space-y-5'>
                    <div className='flex gap-6'>
                        <input 
                            name="name"
                            placeholder="Enter Full Name"
                            value={form.name}
                            onChange={handleChange}
                            className='w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <input 
                            name="email"
                            placeholder="Enter Email"
                            vlaue={form.email}
                            onChange={handleChange}
                            className='w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                    <div className='flex gap-6'>
                        <input 
                            name="phone"
                            placeholder='Enter Mobile Number'
                            value={form.phone}
                            onChange={handleChange}
                            className='w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <input 
                            name="department"
                            placeholder="Enter Department"
                            value={form.department}
                            onChange={handleChange}
                            className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:rong-blue-500"
                        />
                        
                    </div>
                    <div className='flex justify-center pt-3'>
                        <button
                            type="submit" 
                            className='bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg shadow'
                        >
                            Add Host
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AdminHostAdd