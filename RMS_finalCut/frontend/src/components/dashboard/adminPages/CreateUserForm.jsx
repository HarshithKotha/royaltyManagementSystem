import React, { useState } from "react";
import { createUser } from "../../../services/userService";

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    mobileNo: "",
    role: "Artist",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const validateForm = () => {
    let validationErrors = {};
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    const fullNameRegex = /^[a-zA-Z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[0-9]).{6,}$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!usernameRegex.test(formData.username)) {
      validationErrors.username = "Username must be at least 3 characters and contain no special characters.";
    }
    if (!fullNameRegex.test(formData.fullName)) {
      validationErrors.fullName = "Full Name must contain only letters and spaces.";
    }
    if (!emailRegex.test(formData.email)) {
      validationErrors.email = "Invalid email format.";
    }
    if (!passwordRegex.test(formData.password)) {
      validationErrors.password = "Password must be at least 6 characters and contain a number.";
    }
    if (!mobileRegex.test(formData.mobileNo)) {
      validationErrors.mobileNo = "Mobile number must be exactly 10 digits.";
    }
    if (formData.address.trim() === "") {
      validationErrors.address = "Address cannot be empty.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await createUser(formData);
      setStatusMessage(response.message || "User created successfully!");
      setStatusType("success");

      // Reset form
      setFormData({
        username: "",
        fullName: "",
        email: "",
        password: "",
        mobileNo: "",
        role: "Artist",
        address: "",
      });
      setErrors({});
    } catch (error) {
      setStatusMessage(error.message || "Error creating user");
      setStatusType("error");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <header className="bg-white shadow-md py-4 px-6 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Create User Account</h1>
      </header>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          {["username", "fullName", "email", "password", "mobileNo", "address"].map((field) => (
            <div className="mb-4" key={field}>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                id={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder={`Enter ${field}`}
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Artist">Artist</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
          >
            Create User
          </button>

          {statusMessage && (
            <p className={`mt-4 font-semibold ${statusType === "success" ? "text-green-600" : "text-red-600"}`}>
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateUserForm;
