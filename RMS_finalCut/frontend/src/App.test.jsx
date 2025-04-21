import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import App from "./App";
import { describe, it, expect, vi } from "vitest";
// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
}));
// Mock AppRoutes
vi.mock("./routes/AppRoutes", () => ({
  default: () => <div>App Routes</div>
}));
describe("App Component", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("App Routes")).toBeInTheDocument();
  });
});