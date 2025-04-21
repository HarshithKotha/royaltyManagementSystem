import { render, waitFor, act } from "@testing-library/react";

import { ArtistsManagersProvider, useArtistsManagers } from "./ArtistsManagersContext";

import axios from "axios";

import React from "react";

import "@testing-library/jest-dom";

import { expect, describe, it, beforeEach, vi } from "vitest";
 
vi.mock("axios");
 
// Mock Child Component

const MockChild = () => {

    const { artists, managers, managerStats } = useArtistsManagers();
 
    console.log("Artists:", artists.length);

    console.log("Managers:", managers.length);

    console.log("Manager Stats:", managerStats.length);
 
    return (
<div>
<p data-testid="artists-count">{artists.length}</p>
<p data-testid="managers-count">{managers.length}</p>
<p data-testid="manager-stats-count">{managerStats.length}</p>
</div>

    );

};
 
describe("ArtistsManagersContext", () => {

    beforeEach(() => {

        vi.clearAllMocks();

        sessionStorage.setItem("token", "mockToken");

    });
 
    it("provides default values", () => {

        const { getByTestId } = render(
<ArtistsManagersProvider>
<MockChild />
</ArtistsManagersProvider>

        );
 
        expect(getByTestId("artists-count").textContent).toBe("0");

        expect(getByTestId("managers-count").textContent).toBe("0");

        expect(getByTestId("manager-stats-count").textContent).toBe("0");

    });
 
    it("fetches artists and managers successfully", async () => {

        const mockArtists = [

            { _id: "artist1", fullName: "Artist One", manager: "manager1", totalStreams: 100, fullRoyalty: 500 },

            { _id: "artist2", fullName: "Artist Two", manager: "manager1", totalStreams: 50, fullRoyalty: 300 }

        ];

        const mockManagers = [

            { _id: "manager1", fullName: "Manager One" },

            { _id: "manager2", fullName: "Manager Two" }

        ];
 
        axios.get.mockImplementation((url) => {

            if (url.includes("Artist")) return Promise.resolve({ data: { users: mockArtists } });

            if (url.includes("Manager")) return Promise.resolve({ data: { users: mockManagers } });

            return Promise.reject(new Error("Invalid API Call"));

        });
 
        const { getByTestId } = render(
<ArtistsManagersProvider>
<MockChild />
</ArtistsManagersProvider>

        );
 
        await waitFor(() => {

            expect(getByTestId("artists-count").textContent).toBe("2");

            expect(getByTestId("managers-count").textContent).toBe("2");

            expect(getByTestId("manager-stats-count").textContent).toBe("2"); // Updated expected value

        });

    });
 
    it("handles API failure gracefully", async () => {

        axios.get.mockRejectedValue(new Error("Fetch error"));
 
        const { getByTestId } = render(
<ArtistsManagersProvider>
<MockChild />
</ArtistsManagersProvider>

        );
 
        await waitFor(() => {

            expect(getByTestId("artists-count").textContent).toBe("0");

            expect(getByTestId("managers-count").textContent).toBe("0");

            expect(getByTestId("manager-stats-count").textContent).toBe("0");

        });

    });
 
    it("does not fetch data if token is missing", async () => {

        sessionStorage.removeItem("token");
 
        const { getByTestId } = render(
<ArtistsManagersProvider>
<MockChild />
</ArtistsManagersProvider>

        );
 
        await waitFor(() => {

            expect(getByTestId("artists-count").textContent).toBe("0");

            expect(getByTestId("managers-count").textContent).toBe("0");

            expect(getByTestId("manager-stats-count").textContent).toBe("0");

        });
 
        expect(axios.get).not.toHaveBeenCalled();

    });

});
 