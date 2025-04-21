import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import TransactionService from "./TransactionService";
import { expect, describe, it, beforeEach, afterEach } from "vitest";
 
const mock = new MockAdapter(axios);
const API_BASE_URL = "http://localhost:5003/api/transactions";
const token = "mocked_token";
 
beforeEach(() => {
  sessionStorage.setItem("token", token);
});
 
afterEach(() => {
  mock.reset();
  sessionStorage.removeItem("token");
});
 
describe("TransactionService API Tests", () => {
  // fetchTransactions
  it("fetchTransactions should return an empty array if role or ID is missing", async () => {
    const transactions = await TransactionService.fetchTransactions("", "");
    expect(transactions).toEqual([]);
  });
 
  it("fetchTransactions should handle network errors gracefully", async () => {
    mock.onGet(`${API_BASE_URL}/user/artist/1`).networkError();
    const transactions = await TransactionService.fetchTransactions("Artist", 1);
    expect(transactions).toEqual([]);
  });
 
  it("fetchTransactions should return transactions for a valid role and ID", async () => {
    const mockResponse = [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
    mock.onGet(`${API_BASE_URL}/user/artist/1`).reply(200, mockResponse);
 
    const transactions = await TransactionService.fetchTransactions("Artist", 1);
    expect(transactions).toEqual(mockResponse);
  });
 
  it("fetchTransactions should handle invalid role gracefully", async () => {
    mock.onGet(`${API_BASE_URL}/user/invalid/1`).reply(404);
 
    const transactions = await TransactionService.fetchTransactions("Invalid", 1);
    expect(transactions).toEqual([]);
  });
 
  it("fetchTransactions should handle server errors gracefully", async () => {
    mock.onGet(`${API_BASE_URL}/user/artist/1`).reply(500);
 
    const transactions = await TransactionService.fetchTransactions("Artist", 1);
    expect(transactions).toEqual([]);
  });
 
  // fetchWalletAmount
  it("fetchWalletAmount should calculate wallet amount for Artist role", () => {
    const transactions = [
      { id: 1, artistShare: 100, managerShare: 50 },
      { id: 2, artistShare: 200, managerShare: 100 },
    ];
    const total = TransactionService.fetchWalletAmount(transactions, "Artist");
    expect(total).toBe(300); // 100 + 200
  });
 
  it("fetchWalletAmount should calculate wallet amount for Manager role", () => {
    const transactions = [
      { id: 1, artistShare: 100, managerShare: 50 },
      { id: 2, artistShare: 200, managerShare: 100 },
    ];
    const total = TransactionService.fetchWalletAmount(transactions, "Manager");
    expect(total).toBe(150); // 50 + 100
  });
 
//   it("fetchWalletAmount should handle null or undefined transactions", () => {
//     const total = TransactionService.fetchWalletAmount(null, "Artist");
//     expect(total).toBe(0);
//   });
 
  it("fetchWalletAmount should handle transactions with null or undefined values", () => {
    const transactions = [
      { id: 1, artistShare: null, managerShare: undefined },
      { id: 2, artistShare: 200, managerShare: 100 },
    ];
    const total = TransactionService.fetchWalletAmount(transactions, "Artist");
    expect(total).toBe(200); // 0 + 200
  });
 
  // downloadTransactionsPDF
  it("downloadTransactionsPDF should return an error if role or ID is missing", async () => {
    await expect(TransactionService.downloadTransactionsPDF("", ""))
      .rejects.toThrow("Failed to download PDF");
  });
 
  it("downloadTransactionsPDF should handle network errors gracefully", async () => {
    mock.onGet(`${API_BASE_URL}/export/artist/1`).networkError();
    await expect(TransactionService.downloadTransactionsPDF("Artist", 1))
      .rejects.toThrow("Failed to download PDF");
  });
 
  it("downloadTransactionsPDF should download PDF for a valid role and ID", async () => {
    const mockBlob = new Blob(["mock PDF content"], { type: "application/pdf" });
    mock.onGet(`${API_BASE_URL}/export/artist/1`).reply(200, mockBlob);
 
    const result = await TransactionService.downloadTransactionsPDF("Artist", 1);
    expect(result).toEqual(mockBlob);
  });
 
  it("downloadTransactionsPDF should handle server errors gracefully", async () => {
    mock.onGet(`${API_BASE_URL}/export/artist/1`).reply(500);
 
    await expect(TransactionService.downloadTransactionsPDF("Artist", 1))
      .rejects.toThrow("Failed to download PDF");
  });
 
  it("downloadTransactionsPDF should handle invalid role gracefully", async () => {
    await expect(TransactionService.downloadTransactionsPDF("Invalid", 1))
      .rejects.toThrow("Failed to download PDF");
  });
 
  // createTransaction
  it("createTransaction should return an error when transaction data is invalid", async () => {
    mock.onPost(API_BASE_URL).reply(400, { error: "Invalid transaction data" });
 
    const response = await TransactionService.createTransaction({});
    expect(response).toEqual({ success: false, message: "Invalid transaction data" });
  });
 
  it("createTransaction should create a transaction with valid data", async () => {
    const transactionData = { amount: 100, description: "Test transaction" };
    mock.onPost(API_BASE_URL).reply(200);
 
    const result = await TransactionService.createTransaction(transactionData);
    expect(result).toEqual({ success: true, message: "Transaction created successfully!" });
  });
 
  it("createTransaction should handle missing required fields", async () => {
    const transactionData = { amount: 100 }; // Missing description
    mock.onPost(API_BASE_URL).reply(400, { error: "Missing required fields" });
 
    const result = await TransactionService.createTransaction(transactionData);
    expect(result).toEqual({ success: false, message: "Missing required fields" });
  });
 
  it("createTransaction should handle server errors gracefully", async () => {
    const transactionData = { amount: 100, description: "Test transaction" };
    mock.onPost(API_BASE_URL).reply(500);
 
    const result = await TransactionService.createTransaction(transactionData);
    expect(result).toEqual({ success: false, message: "Error creating transaction." });
  });
 
  // deleteTransaction
  it("deleteTransaction should return an error when transaction ID is invalid", async () => {
    mock.onDelete(`${API_BASE_URL}/invalid`).reply(400, { error: "Invalid ID" });
 
    const response = await TransactionService.deleteTransaction("invalid");
    expect(response).toEqual({ success: false, message: "Invalid ID" });
  });
 
  it("deleteTransaction should delete a transaction with a valid ID", async () => {
    mock.onDelete(`${API_BASE_URL}/1`).reply(200);
 
    const result = await TransactionService.deleteTransaction(1);
    expect(result).toEqual({ success: true, message: "Transaction deleted successfully!" });
  });
 
  it("deleteTransaction should handle server errors gracefully", async () => {
    mock.onDelete(`${API_BASE_URL}/1`).reply(500);
 
    const result = await TransactionService.deleteTransaction(1);
    expect(result).toEqual({ success: false, message: "Error deleting transaction." });
  });
 
  // payTransaction
  it("payTransaction should return an error when transaction ID or payment amount is missing", async () => {
    const response = await TransactionService.payTransaction(null, null);
    expect(response).toEqual({ success: false, message: "Error processing payment." });
  });
 
  it("payTransaction should return an error when API responds with failure", async () => {
    mock.onPost(`${API_BASE_URL}/pay`).reply(400, { error: "Invalid payment" });
    const response = await TransactionService.payTransaction(15, 200);
    expect(response).toEqual({ success: false, message: "Invalid payment" });
  });
 
  it("payTransaction should process payment with valid ID and amount", async () => {
    mock.onPost(`${API_BASE_URL}/pay`).reply(200);
 
    const result = await TransactionService.payTransaction(1, 100);
    expect(result).toEqual({ success: true, message: "Payment successful!" });
  });
 
  it("payTransaction should handle server errors gracefully", async () => {
    mock.onPost(`${API_BASE_URL}/pay`).reply(500);
 
    const result = await TransactionService.payTransaction(1, 100);
    expect(result).toEqual({ success: false, message: "Error processing payment." });
  });
});