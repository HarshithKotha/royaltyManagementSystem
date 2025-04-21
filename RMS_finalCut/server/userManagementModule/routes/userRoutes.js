const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {verifyUser} = require('../middleware/authMiddleware')


router.post('/', verifyUser,userController.createUser);
router.get('/:username', verifyUser,userController.getUserByUsername);
router.put('/:username',verifyUser, userController.updateUser);
router.delete('/:username', verifyUser,userController.deleteUser);
router.get('/role/:role',verifyUser,userController.getAllUsers);
router.put('/toggle/:id',  verifyUser,userController.toggleUserStatus);

module.exports = router;