import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { loginUser, resetPassword, forgotPassword } from "./AuthServices";
import { expect, describe, it, afterEach, vi } from "vitest";
 
const mock = new MockAdapter(axios);
const API_URL = "http://localhost:5001/api/auth";
 
describe("Auth API", () => {
    afterEach(() => {
        mock.reset();
    });
 
    it("loginUser should throw an error on failed login", async () => {
        const mockError = { error: "Invalid credentials" };
        mock.onPost(`${API_URL}/login`).reply(400, mockError);
 
        await expect(loginUser("test@example.com", "wrongpassword")).rejects.toEqual("Invalid credentials");
    });
 
    it("loginUser should throw a generic error on server error", async () => {
        mock.onPost(`${API_URL}/login`).reply(500);
 
        await expect(loginUser("test@example.com", "password123")).rejects.toEqual("Server Error");
    });
 
    it("resetPassword should throw an error on invalid token or ID", async () => {
        const mockError = { message: "Invalid token or user ID" };
        mock.onPost(`${API_URL}/reset-password/1/invalid-token`).reply(400, mockError);
 
        await expect(resetPassword(1, "invalid-token", "newpassword123")).rejects.toEqual("Invalid token or user ID");
    });
 
    it("resetPassword should throw a generic error on server error", async () => {
        mock.onPost(`${API_URL}/reset-password/1/mock-token`).reply(500);
 
        await expect(resetPassword(1, "mock-token", "newpassword123")).rejects.toEqual("Server Error. Please try again later.");
    });
 
    it("forgotPassword should throw an error if email is not registered", async () => {
        const mockError = { message: "Email not found" };
        mock.onPost(`${API_URL}/forgot-password`).reply(404, mockError);
 
        await expect(forgotPassword("nonexistent@example.com")).rejects.toEqual("Email not found");
    });
 
    it("forgotPassword should throw a generic error on server error", async () => {
        mock.onPost(`${API_URL}/forgot-password`).reply(500);
 
        await expect(forgotPassword("test@example.com")).rejects.toEqual("Server error. Please try again later.");
    });
});