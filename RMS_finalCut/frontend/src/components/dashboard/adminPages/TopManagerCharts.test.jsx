import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";  
import TopManagersChart from "./TopManagerCharts";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("TopManagersChart Component", () => {
  it("renders 'No Manager Data Available' when data is empty", () => {
    render(<TopManagersChart data={[]} />);
    expect(screen.getByText("No Manager Data Available")).toBeInTheDocument();
  });

  it("renders the chart titles correctly", () => {
    const mockData = [
      { name: "John Doe", totalStreams: 1000, totalRoyalty: 500 },
      { name: "Jane Smith", totalStreams: 2000, totalRoyalty: 800 },
    ];

    render(<TopManagersChart data={mockData} />);
    expect(screen.getByText("Top Managers Performance")).toBeInTheDocument();
    expect(screen.getByText("Total Streams")).toBeInTheDocument();
    expect(screen.getByText("Full Royalty Earned")).toBeInTheDocument();
  });
});
