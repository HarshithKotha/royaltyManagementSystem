import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  fetchCollaborationRequests,
  handleCollaborationRequest,
  sendCollaborationRequest,
  cancelCollaboration,
  handleCancellationResponse,
  fetchCollaborationsByUserAndRole,
} from "./CollaborationService";
import { expect, describe, it, beforeEach, afterEach } from "vitest";

const mock = new MockAdapter(axios);
const API_BASE_URL = "http://localhost:5004/api/collaborations";
const token = "mocked_token";

beforeEach(() => {
  sessionStorage.setItem("token", token);
});

afterEach(() => {
  mock.reset();
  sessionStorage.removeItem("token");
});

describe("Collaboration API", () => {
  // Fetch Collaboration Requests (Manager)
  it("fetchCollaborationRequests should return collaboration requests", async () => {
    const mockData = { collaborations: [{ id: 1, status: "Pending" }] };
    mock.onGet(`${API_BASE_URL}/1/Manager`).reply(200, mockData);

    const data = await fetchCollaborationRequests(1);
    expect(data).toEqual(mockData.collaborations);
  });

  it("fetchCollaborationRequests should return an empty array if no collaborations exist", async () => {
    mock.onGet(`${API_BASE_URL}/1/Manager`).reply(200, {});

    const data = await fetchCollaborationRequests(1);
    expect(data).toEqual([]);
  });

  it("fetchCollaborationRequests should throw an error if API fails", async () => {
    mock.onGet(`${API_BASE_URL}/1/Manager`).reply(500);

    await expect(fetchCollaborationRequests(1)).rejects.toThrow();
  });

  // Handle Collaboration Request (Accept/Reject with reason)
  it("handleCollaborationRequest should update request status", async () => {
    mock.onPut(`${API_BASE_URL}/10`).reply(200);

    await expect(handleCollaborationRequest(10, "Approved")).resolves.not.toThrow();
  });

  it("handleCollaborationRequest should throw an error if requestId is invalid", async () => {
    mock.onPut(`${API_BASE_URL}/NaN`).reply(400);

    await expect(handleCollaborationRequest(NaN, "Approved")).rejects.toThrow();
  });

  // Send Collaboration Request
  it("sendCollaborationRequest should return created collaboration", async () => {
    const mockResponse = { message: "Request sent" };
    mock.onPost(API_BASE_URL).reply(201, mockResponse);

    const response = await sendCollaborationRequest(5, 10);
    expect(response).toEqual(mockResponse);
  });

  it("sendCollaborationRequest should throw an error if artistId or managerId is missing", async () => {
    mock.onPost(API_BASE_URL).reply(400);

    await expect(sendCollaborationRequest(null, 10)).rejects.toThrow();
  });

  // Cancel Collaboration
  it("cancelCollaboration should cancel a collaboration", async () => {
    mock.onPut(`${API_BASE_URL}/30/cancel`).reply(200);

    await expect(cancelCollaboration(30, "Artist unavailable")).resolves.not.toThrow();
  });

  it("cancelCollaboration should throw an error if collaborationId is invalid", async () => {
    mock.onPut(`${API_BASE_URL}/null/cancel`).reply(400);

    await expect(cancelCollaboration(null, "Invalid ID")).rejects.toThrow();
  });

  // Handle Cancellation Response
  it("handleCancellationResponse should update collaboration status", async () => {
    mock.onPut(`${API_BASE_URL}/40/cancel-response`).reply(200);

    await expect(handleCancellationResponse(40, "Accepted")).resolves.not.toThrow();
  });

  it("handleCancellationResponse should throw an error if collaborationId is missing", async () => {
    mock.onPut(`${API_BASE_URL}/undefined/cancel-response`).reply(400);

    await expect(handleCancellationResponse(undefined, "Accepted")).rejects.toThrow();
  });

  // Fetch Collaborations by User and Role
  it("fetchCollaborationsByUserAndRole should return collaborations", async () => {
    const mockData = { collaborations: [{ id: 2, status: "Approved" }] };
    mock.onGet(`${API_BASE_URL}/3/Artist`).reply(200, mockData);

    const data = await fetchCollaborationsByUserAndRole(3, "Artist");
    expect(data).toEqual(mockData.collaborations);
  });

  it("fetchCollaborationsByUserAndRole should return an empty array if no collaborations exist", async () => {
    mock.onGet(`${API_BASE_URL}/3/Artist`).reply(200, {});

    const data = await fetchCollaborationsByUserAndRole(3, "Artist");
    expect(data).toEqual([]);
  });

  it("fetchCollaborationsByUserAndRole should throw an error if userId or role is invalid", async () => {
    mock.onGet(`${API_BASE_URL}/null/Artist`).reply(400);

    await expect(fetchCollaborationsByUserAndRole(null, "Artist")).rejects.toThrow();
  });
});
