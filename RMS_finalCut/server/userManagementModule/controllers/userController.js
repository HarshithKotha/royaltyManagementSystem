const { routeHandler } = require('ca-webutils/expressx');
const User = require('../models/userModel.js');
const UserService = require('../services/userService');
const userService=new UserService();
 
const userController = {
    createUser: routeHandler(async ({ body }) => {
        const user = await userService.createUser(body);
        return {
            ok: true, 
            user
        };
    }),
 
    getUserByUsername: routeHandler(async ({ params }) => {
        const { username } = params;
        
        const user = await userService.getUserProfileByUsername(username);
        if (!user) {
            throw new Error('User not found');
        }
 
        return {
            success: true,
            user
        };
    }),
 
    updateUser: routeHandler(async ({ params, body }) => {
        const { username } = params;
      
        const user = await userService.updateUserProfile(username, body);
     
        if (!user) {
            throw new Error('User not found');
        }
 
        return {
            success: true,
            user
        };
    }),
 
    deleteUser: routeHandler(async ({ params }) => {
        const { username } = params;
        const success = await userService.deleteUser(username);
        if (!success) {
            throw new Error('User deletion failed');
        }
 
        return {
            success: true,
            message: 'User deleted successfully'
        };
    }),
 
    getAllUsers: routeHandler(async ({ params }) => {
        const { role } = params;
        const users = await userService.getAllUsers(role);
        return {
            success: true,
            users
        };
    }),
 
    toggleUserStatus: routeHandler(async ({ params, body }) => {
        const { id } = params;
        const { isActive } = body;
    
        const user = await userService.toggleUserStatus(id, isActive);
    
        return {
          success: true,
          user
        };
      })
};
 
module.exports = userController;