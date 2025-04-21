import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RoleBaseRoutes from "../utils/RoleBaseRoutes";
import { useAuth } from "../context/authContext";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom"; // Ensure jest-dom is imported
 
vi.mock("../context/authContext", () => ({
  useAuth: vi.fn(),
}));
 
const MockComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;
 
const renderWithRouter = (component, initialRoute = "/protected") => {
  return render(
<MemoryRouter initialEntries={[initialRoute]}>
<Routes>
<Route path="/login" element={<LoginComponent />} />
<Route path="/protected" element={component} />
</Routes>
</MemoryRouter>
  );
};
 
describe("RoleBaseRoutes Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  it("renders loading state when loading is true", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
 
    renderWithRouter(
<RoleBaseRoutes requiredRole={["admin"]}>
<MockComponent />
</RoleBaseRoutes>
    );
 
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
 
  it("redirects to /login when user is null", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
 
    renderWithRouter(
<RoleBaseRoutes requiredRole={["admin"]}>
<MockComponent />
</RoleBaseRoutes>
    );
 
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
 
  it("redirects to /login when user role is not allowed", () => {
    useAuth.mockReturnValue({ user: { name: "Test User", role: "viewer" }, loading: false });
 
    renderWithRouter(
<RoleBaseRoutes requiredRole={["admin"]}>
<MockComponent />
</RoleBaseRoutes>
    );
 
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
 
  it("renders children when user has a valid role", () => {
    useAuth.mockReturnValue({ user: { name: "Test User", role: "admin" }, loading: false });
 
    renderWithRouter(
<RoleBaseRoutes requiredRole={["admin"]}>
<MockComponent />
</RoleBaseRoutes>
    );
 
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});