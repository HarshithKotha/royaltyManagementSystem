import React, { useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/AuthServices"; // Import API function
 
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
 
    const validate = () => {
        let newErrors = [];
        if (!email) newErrors.push("Email is required");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.push("Invalid email address");
        if (!password) newErrors.push("Password is required");
        else if (password.length < 6) newErrors.push("Password must be at least 6 characters");
 
        setError(newErrors.join("\n"));
        return newErrors.length === 0;
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
 
        try {
            const data = await loginUser(email, password); // Call API function
            if (data.success) {
                sessionStorage.setItem("token", data.token); // Store token
 
                // Trigger context update with login
                login(data.user, data.token);
 
                // Navigate to appropriate dashboard based on user role
                if (data?.user?.role === "Admin") navigate("/admin-dashboard");
                else if (data?.user.role === "Manager") navigate("/manager-dashboard");
                else if (data?.user?.role === "Artist") navigate("/artist-dashboard");
            } else if (data?.loginStatus?.status === "first time login") {
                navigate(`/reset-password/${data.user._id}/${data.token}`);
            }
        } catch (errorMessage) {
            setError(errorMessage);
        }
    };
 
    return (
        <div className="flex flex-col items-center h-screen justify-center bg-gradient-to-b from-teal-600 to-gray-100 space-y-6 p-4">
            <h2 className="font-cavet text-2xl sm:text-3xl md:text-4xl text-white text-center">
                Royalty Management System
            </h2>
            <div className="border shadow p-6 w-full max-w-sm bg-white rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                            placeholder="Enter Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
 
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                            placeholder="*******"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
 
                    <div className="mb-4 flex items-center justify-between">
                        <Link to="/forgot-password" className="text-blue-500 hover:text-blue-700 underline text-sm">
                            Forgot Password
                        </Link>
                        <Link to="/home-page" className="text-blue-500 text-right hover:text-blue-700 underline text-sm">
                            Go to home
                        </Link>
                    </div>
 
                    <div className="mb-4">
                        <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition duration-300">
                            Login
                        </button>
                    </div>
                </form>
            </div>
            <footer className="w-full py-4 mt-10">
                <div className="container mx-auto text-center text-teal-600 font-semibold text-sm sm:text-base">
                    &copy; 2025 Royalty Management System. All rights reserved.
                </div>
            </footer>
        </div>
    );
};
 
export default Login;
