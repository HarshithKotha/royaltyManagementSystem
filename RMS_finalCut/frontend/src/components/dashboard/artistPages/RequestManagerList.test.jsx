import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestManagerList from './RequestManagerList';
import { useAuth } from '../../../context/authContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useArtistsManagers } from '../../../context/ArtistsManagersContext';
import { sendCollaborationRequest, fetchCollaborationsByUserAndRole } from '../../../services/CollaborationService';
 
// Mock the hooks and services
vi.mock('../../../context/authContext');
vi.mock('../../../context/NotificationContext');
vi.mock('../../../context/ArtistsManagersContext');
vi.mock('../../../services/CollaborationService');
 
describe('RequestManagerList Component', () => {
  const mockUser = {
    _id: 'user123',
    fullName: 'Test Artist',
    manager: null
  };
 
  const mockManagers = [
    {
      _id: 'manager1',
      managerId: 'manager1',
      fullName: 'John Manager',
      email: 'john@example.com',
      mobileNo: '1234567890',
      address: '123 Manager St',
      commissionPercentage: 15,
      managedArtists: ['artist1', 'artist2'],
      description: 'Experienced manager'
    },
    {
      _id: 'manager2',
      managerId: 'manager2',
      fullName: 'Sarah Manager',
      email: 'sarah@example.com',
      mobileNo: '0987654321',
      address: '456 Manager Ave',
      commissionPercentage: 12,
      managedArtists: ['artist3'],
      description: 'New but promising manager'
    }
  ];
 
  beforeEach(() => {
    // Default mock implementations
    useAuth.mockReturnValue({ userData: mockUser });
    useArtistsManagers.mockReturnValue({ managers: mockManagers });
    useNotifications.mockReturnValue({ sendNotification: vi.fn().mockResolvedValue(true) });
    fetchCollaborationsByUserAndRole.mockResolvedValue([]);
    sendCollaborationRequest.mockResolvedValue({ success: true });
  });
 
  afterEach(() => {
    vi.clearAllMocks();
  });
 
  it('should display a loading message while fetching managers', async () => {
    // Set loading state to be visible initially
    fetchCollaborationsByUserAndRole.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([]), 1000);
      });
    });
 
    render(<RequestManagerList />);
    expect(screen.getByText('Loading managers...')).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText('Loading managers...')).toBeFalsy();
    }, { timeout: 1100 });
  });
 
  it('should allow sending a collaboration request', async () => {
    render(<RequestManagerList />);
    await waitFor(() => {
      expect(screen.getAllByText('Send Request')[0]).toBeTruthy();
    });
    // Click on Send Request button for the first manager
    fireEvent.click(screen.getAllByText('Send Request')[0]);
    // Verify that the service was called
    await waitFor(() => {
      expect(sendCollaborationRequest).toHaveBeenCalledWith('user123', 'manager1');
      expect(useNotifications().sendNotification).toHaveBeenCalledWith(
        'manager1',
        'Test Artist requested you for collaboration.',
        'collaborationRequest'
      );
    });
    // After request is sent, it should show the "Request Sent" message
    await waitFor(() => {
      expect(screen.getByText('Request Sent to this Manager')).toBeTruthy();
    });
  });
 
  it('should filter managers based on search term', async () => {
    render(<RequestManagerList />);
    // Wait for managers to load
    await waitFor(() => {
      expect(screen.getByText('John Manager')).toBeTruthy();
      expect(screen.getByText('Sarah Manager')).toBeTruthy();
    });
    // Get the search input and type "Sarah"
    const searchInput = screen.getByPlaceholderText('Search here...');
    fireEvent.change(searchInput, { target: { value: 'Sarah' } });
    // Verify only Sarah is visible
    expect(screen.queryByText('John Manager')).toBeFalsy();
    expect(screen.getByText('Sarah Manager')).toBeTruthy();
    // Clear search to see all managers again
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText('John Manager')).toBeTruthy();
      expect(screen.getByText('Sarah Manager')).toBeTruthy();
    });
  });
 
  it('should display a message when user already has a manager', async () => {
    // Mock user with existing manager
    useAuth.mockReturnValue({ 
      userData: { ...mockUser, manager: 'existingManager' } 
    });
    render(<RequestManagerList />);
    // Check for the message
    expect(screen.getByText('You already have a manager! You cannot send new requests.')).toBeTruthy();
    // Send Request buttons should not be available
    expect(screen.queryByText('Send Request')).toBeFalsy();
  });
 
  it('should display a message when user has a pending request', async () => {
    // Mock a pending collaboration request
    fetchCollaborationsByUserAndRole.mockResolvedValue([
      { managerId: 'manager1', status: 'Pending' }
    ]);
    render(<RequestManagerList />);
    // Check for the pending message
    await waitFor(() => {
      expect(screen.getByText('You already have a pending request. Wait for the manager to respond before sending another request. If there is no response for two days contact admin')).toBeTruthy();
    });
    // The button for manager1 should show "Request Sent to this Manager"
    await waitFor(() => {
      expect(screen.getByText('Request Sent to this Manager')).toBeTruthy();
    });
    // The button for manager2 should be disabled
    const manager2Button = screen.getAllByText('Send Request')[0];
    expect(manager2Button).toBeDisabled();
    expect(manager2Button.closest('button')).toHaveClass('bg-gray-400 cursor-not-allowed');
  });
 
  it('should display a message when no managers are found after search', async () => {
    render(<RequestManagerList />);
    // Wait for managers to load
    await waitFor(() => {
      expect(screen.getByText('John Manager')).toBeTruthy();
    });
    // Search for a non-existent manager
    const searchInput = screen.getByPlaceholderText('Search here...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
    // Verify no results message
    expect(screen.getByText('No managers found.')).toBeTruthy();
  });
 
  it('should display a message when no managers are available', async () => {
    // Mock empty managers list
    useArtistsManagers.mockReturnValue({ managers: [] });
    render(<RequestManagerList />);
    await waitFor(() => {
      expect(screen.getByText('No managers available.')).toBeTruthy();
    });
  });
 
  it('should handle error when sending collaboration request', async () => {
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock service to throw error
    sendCollaborationRequest.mockRejectedValue(new Error('Request failed'));
    render(<RequestManagerList />);
    await waitFor(() => {
      const sendRequestButtons = screen.getAllByText('Send Request');
      expect(sendRequestButtons.length).toBeGreaterThan(0);
    });
    // Click on Send Request button
    fireEvent.click(screen.getAllByText('Send Request')[0]);
    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending collaboration request:', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });
 
  it('should handle error when fetching collaboration requests', async () => {
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock service to throw error
    fetchCollaborationsByUserAndRole.mockRejectedValue(new Error('Fetch failed'));
    render(<RequestManagerList />);
    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching collaboration requests:', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });
});