import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import TransactionList from "./TransactionList";
import TransactionService from "../../../services/TransactionService";
import { useNotifications } from "../../../context/NotificationContext";

// Mock the services and hooks
vi.mock("../../../services/TransactionService");
vi.mock("../../../context/NotificationContext");

describe("TransactionList", () => {
  // Mock data
  const mockTransactions = [
    {
      _id: "1",
      songId: { songName: "Test Song 1" },
      transactionAmount: 100,
      status: "Pending",
      userId: {
        artistId: "artist1",
        manager: {
          managerId: "manager1",
          commissionPercentage: 10,
        },
      },
    },
    {
      _id: "2",
      songId: { songName: "Test Song 2" },
      transactionAmount: 200,
      status: "Approved",
      userId: {
        artistId: "artist2",
        manager: {
          managerId: "manager2",
          commissionPercentage: 15,
        },
      },
    },
  ];

  const mockProps = {
    transactions: mockTransactions,
    fetchTransactions: vi.fn(),
    setStatusMessage: vi.fn(),
    selectedArtist: "artist1",
    fetchRoyaltyByArtist: vi.fn(),
  };

  const mockSendNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNotifications.mockReturnValue({ sendNotification: mockSendNotification });
    global.confirm = vi.fn(() => true); // Mock confirm dialog
  });

  it("handles pay transaction successfully", async () => {
    TransactionService.payTransaction.mockResolvedValueOnce({
      success: true,
      message: "Payment successful",
    });

    render(<TransactionList {...mockProps} />);

    // Click pay button
    const payButton = screen.getAllByText("Pay")[0];
    fireEvent.click(payButton);

    // Verify confirm dialog was shown
    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      //  Verify service was called
      expect(TransactionService.payTransaction).toHaveBeenCalledWith("1", 100);

      //  Verify notifications were sent
      expect(mockSendNotification).toHaveBeenCalledTimes(2);
      expect(mockSendNotification).toHaveBeenCalledWith(
        "artist1",
        "Your transaction of $90.00 has been successfully processed for the song: Test Song 1.",
        "royaltyPayment"
      );
      expect(mockSendNotification).toHaveBeenCalledWith(
        "manager1",
        "Your transaction of $10.00 has been successfully processed for the song: Test Song 1.",
        "royaltyPayment"
      );

      //  Verify status message was set
      expect(mockProps.setStatusMessage).toHaveBeenCalledWith({
        type: "success",
        text: "Payment successful",
      });

      //  Verify data was refreshed
      expect(mockProps.fetchTransactions).toHaveBeenCalledWith("artist1");
      expect(mockProps.fetchRoyaltyByArtist).toHaveBeenCalledWith("artist1");
    });
  });

  it("handles pay transaction cancellation", () => {
    global.confirm.mockReturnValueOnce(false);

    render(<TransactionList {...mockProps} />);

    const payButton = screen.getAllByText("Pay")[0];
    fireEvent.click(payButton);

    expect(TransactionService.payTransaction).not.toHaveBeenCalled();
    expect(mockSendNotification).not.toHaveBeenCalled();
  });

  it("handles delete transaction successfully", async () => {
    TransactionService.deleteTransaction.mockResolvedValueOnce({
      success: true,
      message: "Transaction deleted",
    });

    render(<TransactionList {...mockProps} />);

    const deleteButton = screen.getAllByText("Cancel")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(TransactionService.deleteTransaction).toHaveBeenCalledWith("1");
      expect(mockProps.setStatusMessage).toHaveBeenCalledWith({
        type: "success",
        text: "Transaction deleted",
      });
      expect(mockProps.fetchTransactions).toHaveBeenCalledWith("artist1");
    });
  });
});
