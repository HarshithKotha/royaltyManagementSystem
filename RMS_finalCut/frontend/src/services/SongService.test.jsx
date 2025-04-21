import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import SongService from "./SongService";
import { expect, describe, it, beforeEach, afterEach, vi } from "vitest";
 
const mock = new MockAdapter(axios);
const API_URL = "http://localhost:5002/api/songs/";
const token = "mocked_token";
 
beforeEach(() => {
  sessionStorage.setItem("token", token);
});
 
afterEach(() => {
  mock.reset();
  sessionStorage.removeItem("token");
});
 
describe("SongService API", () => {
  //  ADD SONG
  it("addSong should successfully add a new song", async () => {
    const newSong = { title: "New Song", artistId: 1 };
    const mockResponse = { message: "Song added successfully" };
    mock.onPost(API_URL).reply(201, mockResponse);
    const response = await SongService.addSong(newSong);
    expect(response).toEqual(mockResponse);
  });
 
  it("addSong should throw an error if the song already exists (409 Conflict)", async () => {
    const newSong = { title: "Duplicate Song", artistId: 1 };
    mock.onPost(API_URL).reply(400);
    await expect(SongService.addSong(newSong)).rejects.toThrow(
      "A song with the same name already exists."
    );
  });
 
  it("addSong should throw a generic error on server failure", async () => {
    const newSong = { title: "Server Error Song", artistId: 1 };
    mock.onPost(API_URL).reply(500);
    await expect(SongService.addSong(newSong)).rejects.toThrow(
      "An error occurred while adding the song."
    );
  });
 
  //  FETCH SONGS BY ARTIST
  it("fetchSongsByArtist should return a list of songs for the given artist", async () => {
    const artistId = 5;
    const mockResponse = { songs: [{ id: 1, title: "Hit Song" }] };
    mock.onGet(`${API_URL}artist/${artistId}`).reply(200, mockResponse);
    const data = await SongService.fetchSongsByArtist(artistId);
    expect(data).toEqual(mockResponse.songs);
  });
 
  it("fetchSongsByArtist should return an empty array if no songs are found", async () => {
    const artistId = 5;
    mock.onGet(`${API_URL}artist/${artistId}`).reply(200, { songs: [] });
    const data = await SongService.fetchSongsByArtist(artistId);
    expect(data).toEqual([]);
  });
 
  it("fetchSongsByArtist should throw an error on failure", async () => {
    const artistId = 5;
    mock.onGet(`${API_URL}artist/${artistId}`).reply(500);
    await expect(SongService.fetchSongsByArtist(artistId)).rejects.toThrow(
      "An error occurred while fetching songs."
    );
  });
 
  //  DELETE SONG
  it("deleteSong should successfully delete a song", async () => {
    const songId = 10;
    const mockResponse = { message: "Song deleted successfully" };
    mock.onDelete(`${API_URL}${songId}`).reply(200, mockResponse);
    const response = await SongService.deleteSong(songId);
    expect(response).toEqual(mockResponse);
  });
 
  it("deleteSong should throw an error if songId is invalid", async () => {
    mock.onDelete(`${API_URL}null`).reply(400);
    await expect(SongService.deleteSong(null)).rejects.toThrow(
      "An error occurred while deleting the song."
    );
  });
 
  it("deleteSong should handle server errors", async () => {
    const songId = 10;
    mock.onDelete(`${API_URL}${songId}`).reply(500);
    await expect(SongService.deleteSong(songId)).rejects.toThrow(
      "An error occurred while deleting the song."
    );
  });
});