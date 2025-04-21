import React, { useEffect, useState } from "react";
import SearchBar from "../../commonComponents/SearchBar";
import { fetchUsersByRole, toggleUserStatus } from "../../../services/userService";

const DeleteUserForm = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const usersData = await fetchUsersByRole("User");
                setUsers(usersData);
                setFilteredUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        getUsers();
    }, []);

    const handleSearch = (searchTerm) => {
        if (!searchTerm) {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase())));
        }
    };

    const handleToggleStatus = async (userId, isActive) => {
        try {
            await toggleUserStatus(userId, isActive);
            setUsers(users.map(user => user._id === userId ? { ...user, isActive } : user));
            setFilteredUsers(filteredUsers.map(user => user._id === userId ? { ...user, isActive } : user));
        } catch (error) {
            console.error("Failed to toggle user status:", error);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4">
            {/* Header with SearchBar */}
            <header className="bg-white shadow-md py-4 px-6 mb-6 flex flex-col md:flex-row items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
                <SearchBar onSearch={handleSearch} />
            </header>

            {/* Users displayed as responsive cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.filter(user => user.role !== "Admin").map((user) => (
                    <div key={user._id} className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{user.username}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <span
                                className={`px-2 py-1 text-sm rounded font-medium ${
                                    user.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                }`}
                            >
                                {user.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div className="mt-2 text-gray-600">Role: {user.role}</div>
                        <div className="mt-4">
                            <button
                                onClick={() => handleToggleStatus(user._id, !user.isActive)}
                                className={`w-full px-4 py-2 rounded text-white font-semibold ${
                                    user.isActive ? "bg-red-500 hover:bg-red-700 cursor-pointer" : "bg-green-500 hover:bg-green-700 cursor-pointer"
                                }`}
                            >
                                {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeleteUserForm;
