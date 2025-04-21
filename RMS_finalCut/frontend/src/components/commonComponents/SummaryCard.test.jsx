import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import SummaryCard from "./SummaryCard";

describe("SummaryCard Component", () => {
  it("renders the SummaryCard with title and value", () => {
    const title = "Total Users";
    const value = "1,234";

    // Render the component with props
    render(<SummaryCard title={title} value={value} />);

    // Check if the title and value are displayed correctly
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();

    // Check if the title and value have the correct classes
    const titleElement = screen.getByText(title);
    const valueElement = screen.getByText(value);

    expect(titleElement).toHaveClass("text-sm", "md:text-lg", "font-semibold", "truncate");
    expect(valueElement).toHaveClass("text-xl", "md:text-2xl", "font-bold", "truncate");
  });

  it("renders the SummaryCard with long title and value", () => {
    const longTitle = "This is a very long title that should be truncated";
    const longValue = "This is a very long value that should be truncated";

    // Render the component with long title and value
    render(<SummaryCard title={longTitle} value={longValue} />);

    // Check if the long title and value are displayed and truncated
    const titleElement = screen.getByText(longTitle);
    const valueElement = screen.getByText(longValue);

    expect(titleElement).toHaveClass("truncate");
    expect(valueElement).toHaveClass("truncate");
  });
});
