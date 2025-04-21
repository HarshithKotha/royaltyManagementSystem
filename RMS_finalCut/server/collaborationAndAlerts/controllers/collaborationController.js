const { routeHandler } = require('ca-webutils/expressx');
const CollaborationService = require('../services/collaborationService');
const collaborationService = new CollaborationService();
const logger = require('../utils/logger');
 
const collaborationController = {
    createCollaboration: routeHandler(async ({ body }) => {
        const collaboration = await collaborationService.createCollaboration(body);
        return { success: true, collaboration };
    }),
 
    getCollaborationsByUserAndRole: routeHandler(async ({ params }) => {
        const { userId, role } = params;
        const collaborations = await collaborationService.getCollaborationsByUserAndRole(userId, role);
        return { success: true, collaborations };
    }),
 
    updateCollaborationStatus: routeHandler(async ({ params, body }) => {
        const { collaborationId } = params;
        const { status } = body;
        const collaboration = await collaborationService.updateCollaborationStatus(collaborationId, status);
        return { success: true, collaboration };
    }),
 
    cancelCollaboration: routeHandler(async ({ params, body }) => {
        const { collaborationId } = params;
        const { reason } = body;
        const collaboration = await collaborationService.requestCancellation(collaborationId, reason);
        return { success: true, collaboration };
    }),
 
    handleCancellationResponse: routeHandler(async ({ params, body }) => {
        const { collaborationId } = params;
        const { response } = body;
        const collaboration = await collaborationService.handleCancellationResponse(collaborationId, response);
        return { success: true, collaboration };
    }),
};
 
module.exports = collaborationController;