const express = require('express');
const { login, verify,forgotPassword,resetPassword } = require('../controllers/authcontroller.js');
const { verifyUser } = require('../middleware/authMiddleware.js'); 

    const router = express.Router();
    console.log('inside auth routes')

    router.post('/login', login);

    router.get('/verify', verifyUser, verify);

    router.post('/forgot-password', forgotPassword)

    router.post('/reset-password/:id/:token',resetPassword)
    
module.exports = router;
