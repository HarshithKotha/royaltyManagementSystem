import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";
import "@testing-library/jest-dom";
import { describe, it, beforeEach, expect } from "vitest";

const renderComponent = () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe("HomePage Component", () => {
  beforeEach(() => {
    renderComponent();
  });

  it("renders the navbar with site title and login link", () => {
    expect(screen.getByText(/Royalty Management System/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();
  });

  it("renders the hero section with heading and call-to-action button", () => {
    expect(screen.getByText(/Manage Your Royalties Seamlessly/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get Started/i })).toBeInTheDocument();
  });

  it("renders the features section with key features", () => {
    expect(screen.getByText(/Role-Based Access Control/i)).toBeInTheDocument();
    expect(screen.getByText(/Automated Royalty Calculations/i)).toBeInTheDocument();
    expect(screen.getByText(/Performance Insights/i)).toBeInTheDocument();
  });

  it("renders the How It Works section with steps", () => {
    expect(screen.getByText(/Artists and Managers log in with role-based access./i)).toBeInTheDocument();
    expect(screen.getByText(/Artists can add songs, request managers, and track royalties./i)).toBeInTheDocument();
    expect(screen.getByText(/Admins oversee user accounts, transactions, and generate reports./i)).toBeInTheDocument();
  });

  it("renders the registration info section", () => {
    expect(screen.getByText(/How to Register?/i)).toBeInTheDocument();
    expect(screen.getByText(/royaltymanagementrms@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/7093148469/i)).toBeInTheDocument();
  });

  it("renders the footer with copyright info", () => {
    expect(screen.getByText(/© 2025 Royalty Management. All rights reserved./i)).toBeInTheDocument();
  });
});
