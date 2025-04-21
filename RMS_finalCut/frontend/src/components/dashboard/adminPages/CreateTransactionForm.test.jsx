import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import CreateTransactionForm from "./CreateTransactionForm";
import TransactionService from "../../../services/TransactionService";

// Mock Services & Callbacks
vi.mock("../../../services/TransactionService", () => {
  return {
    default: {
      createTransaction: vi.fn(),
    },
    createTransaction: vi.fn(),
  };
});


const mockSetSelectedRoyalty = vi.fn();
const mockFetchTransactions = vi.fn();
const mockSetStatusMessage = vi.fn();

const selectedRoyalty = {
  _id: "royalty123",
  songId: { _id: "song123", songName: "Test Song" },
  royaltyDue: 200,
};

const selectedArtist = "artist123";

describe("CreateTransactionForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form correctly", () => {
    render(
      <CreateTransactionForm
        selectedRoyalty={selectedRoyalty}
        setSelectedRoyalty={mockSetSelectedRoyalty}
        fetchTransactions={mockFetchTransactions}
        selectedArtist={selectedArtist}
        setStatusMessage={mockSetStatusMessage}
      />
    );

    expect(screen.getByText("Create Transaction")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("validates input and prevents invalid transaction submission", async () => {
    render(
      <CreateTransactionForm
        selectedRoyalty={selectedRoyalty}
        setSelectedRoyalty={mockSetSelectedRoyalty}
        fetchTransactions={mockFetchTransactions}
        selectedArtist={selectedArtist}
        setStatusMessage={mockSetStatusMessage}
      />
    );

    const input = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Submit");

    // Test empty input
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockSetStatusMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", text: "Enter a valid transaction amount!" })
      );
    });

    // Test exceeding royalty amount
    fireEvent.change(input, { target: { value: "300" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockSetStatusMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text: expect.stringContaining("Transaction amount cannot exceed the royalty due"),
        })
      );
    });

    // Ensure API is never called for invalid inputs
    expect(TransactionService.createTransaction).not.toHaveBeenCalled();
  });

  it("submits transaction successfully", async () => {
    TransactionService.createTransaction.mockResolvedValue({
      success: true,
      message: "Transaction successful",
    });

    render(
      <CreateTransactionForm
        selectedRoyalty={selectedRoyalty}
        setSelectedRoyalty={mockSetSelectedRoyalty}
        fetchTransactions={mockFetchTransactions}
        selectedArtist={selectedArtist}
        setStatusMessage={mockSetStatusMessage}
      />
    );

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "100" } });

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    // Wait for status message update
    await waitFor(() => {
      expect(mockSetStatusMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "success", text: "Transaction successful" })
      );
    });

    // Ensure API was called correctly
    expect(TransactionService.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "artist123",
        songId: "song123",
        royaltyId: "royalty123",
        transactionAmount: 100,
      })
    );

    // Ensure selectedRoyalty is cleared after transaction
    await waitFor(() => {
      expect(mockSetSelectedRoyalty).toHaveBeenCalledWith(null);
    });

    // Ensure transactions are re-fetched
    await waitFor(() => {
      expect(mockFetchTransactions).toHaveBeenCalledWith("artist123");
    });
  });

  it("calls setSelectedRoyalty when clicking Cancel", () => {
    render(
      <CreateTransactionForm
        selectedRoyalty={selectedRoyalty}
        setSelectedRoyalty={mockSetSelectedRoyalty}
        fetchTransactions={mockFetchTransactions}
        selectedArtist={selectedArtist}
        setStatusMessage={mockSetStatusMessage}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Ensure setSelectedRoyalty is called with null
    expect(mockSetSelectedRoyalty).toHaveBeenCalledWith(null);
  });
});
