import { render, waitFor } from "@testing-library/react";
import { RoyaltyProvider, useRoyalty } from "./RoyaltyContext";
import axios from "axios";
import React from "react";
import "@testing-library/jest-dom";
import { expect, describe, it, beforeEach, vi } from "vitest";
 
vi.mock("axios");
 
// Test component to consume context
const MockChild = () => {
  const { royalties, selectedArtist, setSelectedArtist, fetchRoyaltyByArtist } = useRoyalty();
 
  return (
<div>
<p data-testid="royalties-count">{royalties.length}</p>
<p data-testid="selected-artist">{selectedArtist || "None"}</p>
<button onClick={() => setSelectedArtist("artist123")}>Set Artist</button>
<button onClick={() => fetchRoyaltyByArtist("artist123")}>Fetch Royalties</button>
</div>
  );
};
 
// Component to check the error case
const ErrorComponent = () => {
  try {
    useRoyalty();
    return <p>No Error</p>;
  } catch (error) {
    return <p>{error.message}</p>;
  }
};
 
describe("RoyaltyContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem("token", "mockToken");
  });
 
  it("provides default values", () => {
    const { getByTestId } = render(
<RoyaltyProvider>
<MockChild />
</RoyaltyProvider>
    );
 
    expect(getByTestId("royalties-count").textContent).toBe("0");
    expect(getByTestId("selected-artist").textContent).toBe("None");
  });
 
  it("sets and retrieves selected artist", async () => {
    const { getByText, getByTestId } = render(
<RoyaltyProvider>
<MockChild />
</RoyaltyProvider>
    );
 
    getByText("Set Artist").click();
 
    // Add waitFor to ensure state update completes
    await waitFor(() => {
      expect(getByTestId("selected-artist").textContent).toBe("artist123");
    });
  });
 
  it("fetches royalties successfully", async () => {
    const mockRoyalties = [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
    axios.get.mockResolvedValueOnce({ data: { royalties: mockRoyalties } });
 
    const { getByText, getByTestId } = render(
<RoyaltyProvider>
<MockChild />
</RoyaltyProvider>
    );
 
    getByText("Fetch Royalties").click();
 
    await waitFor(() => expect(getByTestId("royalties-count").textContent).toBe("2"));
    expect(axios.get).toHaveBeenCalledWith("http://localhost:5003/api/royalty/artists/artist123", expect.any(Object));
  });
 
  it("handles API error when fetching royalties", async () => {
    axios.get.mockRejectedValueOnce(new Error("Fetch error"));
 
    const { getByText, getByTestId } = render(
<RoyaltyProvider>
<MockChild />
</RoyaltyProvider>
    );
 
    getByText("Fetch Royalties").click();
 
    await waitFor(() => {
      // Ensure the test waits for any potential state updates to complete
      expect(getByTestId("royalties-count").textContent).toBe("0");
    });
  });
 
  it("throws an error if useRoyalty is used outside provider", () => {
    const { getByText } = render(<ErrorComponent />);
    expect(getByText("useRoyalty must be used within a RoyaltyProvider")).not.toBeNull();
  });
});