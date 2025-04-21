const { expect } = require("chai");
const sinon = require("sinon");

// This is what we're testing
const notificationController = require("../controllers/notificationController");

describe("Notification Controller Unit Tests", function () {
  let sandbox;
  let mockService;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Create mock service methods
    mockService = {
      createNotification: sandbox.stub(),
      getNotificationsByUser: sandbox.stub(),
      markNotificationAsRead: sandbox.stub()
    };
    
    // Replace the service methods in the controller's service instance
    const realService = notificationController.notificationService || 
                        require("../../../server/collaborationAndAlerts/services/notificationService").prototype;
    
    sandbox.stub(realService, "createNotification").callsFake(mockService.createNotification);
    sandbox.stub(realService, "getNotificationsByUser").callsFake(mockService.getNotificationsByUser);
    sandbox.stub(realService, "markNotificationAsRead").callsFake(mockService.markNotificationAsRead);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("createNotification", function () {
    it("should create a notification successfully", async function () {
      // Setup
      const notificationData = { userId: "123", message: "Test notification" };
      const createdNotification = { id: "1", ...notificationData };
      
      mockService.createNotification.resolves(createdNotification);

      // Mock request/response
      const req = {
        method: "POST",
        body: notificationData
      };
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      const next = sandbox.stub();

      // Execute
      await notificationController.createNotification(req, res, next);

      // Verify service was called
      expect(mockService.createNotification.calledWith(notificationData)).to.be.true;
      
      // Verify response
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        notification: createdNotification
      })).to.be.true;
    });

    it("should handle errors when creating notification", async function () {
        // Setup
        const notificationData = { userId: "123", message: "Test notification" };
        const error = new Error("Failed to create notification");
        
        mockService.createNotification.rejects(error);
      
        // Mock request/response
        const req = {
          method: "POST",
          body: notificationData,
          path: "/notifications",
          url: "/api/notifications",
          params: {},
          query: {}
        };
        const res = {
          status: sandbox.stub().returnsThis(),
          send: sandbox.stub(),
          set: sandbox.stub()
        };
        const next = sandbox.stub();
      
        // Execute
        await notificationController.createNotification(req, res, next);
        
        // Check if either next was called with the error OR if status/send were called
        // to handle the error directly
        const nextCalledWithError = next.calledWith(sinon.match.instanceOf(Error));
        const responseHandledError = res.status.called && res.send.called;
        
        expect(nextCalledWithError || responseHandledError).to.be.true;
        
        // If response handled the error, verify it set an error status code
        if (responseHandledError) {
          const statusArg = res.status.firstCall.args[0];
          expect(statusArg).to.be.at.least(400);
        }
      });
    });

  describe("getNotificationsByUser", function () {
    it("should get notifications for a user successfully", async function () {
      // Setup
      const userId = "123";
      const notifications = [
        { id: "1", userId, message: "Test notification 1" },
        { id: "2", userId, message: "Test notification 2" }
      ];
      
      mockService.getNotificationsByUser.resolves(notifications);

      // Mock request/response
      const req = {
        method: "GET",
        params: { userId }
      };
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      const next = sandbox.stub();

      // Execute
      await notificationController.getNotificationsByUser(req, res, next);

      // Verify service was called
      expect(mockService.getNotificationsByUser.calledWith(userId)).to.be.true;
      
      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        notifications: notifications
      })).to.be.true;
    });

    it("should handle empty notifications array", async function () {
      // Setup
      const userId = "456";
      const notifications = [];
      
      mockService.getNotificationsByUser.resolves(notifications);

      // Mock request/response
      const req = {
        method: "GET",
        params: { userId }
      };
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      const next = sandbox.stub();

      // Execute
      await notificationController.getNotificationsByUser(req, res, next);

      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        notifications: []
      })).to.be.true;
    });
  });

  describe("markAsRead", function () {
    it("should mark a notification as read successfully", async function () {
      // Setup
      const notificationId = "1";
      const updatedNotification = { 
        id: notificationId, 
        userId: "123", 
        message: "Test notification", 
        read: true 
      };
      
      mockService.markNotificationAsRead.resolves(updatedNotification);

      // Mock request/response
      const req = {
        method: "PATCH",
        params: { notificationId }
      };
      const res = {
        status: sandbox.stub().returnsThis(),
        send: sandbox.stub()
      };
      const next = sandbox.stub();

      // Execute
      await notificationController.markAsRead(req, res, next);

      // Verify service was called
      expect(mockService.markNotificationAsRead.calledWith(notificationId)).to.be.true;
      
      // Verify response
      expect(res.status.calledWith(202)).to.be.true;
      expect(res.send.calledWith({
        success: true,
        notification: updatedNotification
      })).to.be.true;
    });

    it("should handle errors when marking notification as read", async function () {
        // Setup
        const notificationId = "999";
        const error = new Error("Notification not found");
        
        mockService.markNotificationAsRead.rejects(error);
      
        // Mock request/response
        const req = {
          method: "PATCH",
          params: { notificationId },
          path: `/notifications/${notificationId}/read`,
          url: `/api/notifications/${notificationId}/read`,
          query: {}
        };
        const res = {
          status: sandbox.stub().returnsThis(),
          send: sandbox.stub(),
          set: sandbox.stub()
        };
        const next = sandbox.stub();
      
        // Execute
        await notificationController.markAsRead(req, res, next);
        
        // Verify error handling - in your routeHandler implementation,
        // errors are handled by setting response status and sending error message
        expect(res.status.called).to.be.true;
        expect(res.send.called).to.be.true;
        
        // The status code will depend on error type, but should be an error code
        const statusCode = res.status.firstCall.args[0];
        expect(statusCode).to.be.at.least(400);
        
        // Response body should contain error information
        const responseBody = res.send.firstCall.args[0];
        expect(responseBody).to.have.property('message');
      });
  });
});