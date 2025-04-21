import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchBar from "./SearchBar";

describe("SearchBar Component", () => {
  let mockOnSearch;

  beforeEach(() => {
    mockOnSearch = vi.fn();
    vi.clearAllMocks();
  });

  it("renders the search input with a placeholder", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    // Check if the input is rendered with the correct placeholder
    const inputElement = screen.getByPlaceholderText(/Search here.../i);
    expect(inputElement).toBeInTheDocument();
  });

  it("updates the input value as the user types", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    // Simulate typing in the input
    const inputElement = screen.getByPlaceholderText(/Search here.../i);
    fireEvent.change(inputElement, { target: { value: "test" } });

    // Check if the input value is updated
    expect(inputElement.value).toBe("test");
  });

  it("calls the onSearch function with the correct value when the input changes", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    // Simulate typing in the input
    const inputElement = screen.getByPlaceholderText(/Search here.../i);
    fireEvent.change(inputElement, { target: { value: "test" } });

    // Check if the onSearch function is called with the correct value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith("test");
  });

  it("clears the input value when the user deletes the text", () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    // Simulate typing in the input
    const inputElement = screen.getByPlaceholderText(/Search here.../i);
    fireEvent.change(inputElement, { target: { value: "test" } });

    // Simulate deleting the text
    fireEvent.change(inputElement, { target: { value: "" } });

    // Check if the input value is cleared
    expect(inputElement.value).toBe("");
    expect(mockOnSearch).toHaveBeenCalledWith("");
  });
});
