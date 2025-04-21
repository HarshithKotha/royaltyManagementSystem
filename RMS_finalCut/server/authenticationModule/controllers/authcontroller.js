const jwt =require('jsonwebtoken');
const User =require('../models/userModel.js');
const bcrypt =require('bcrypt');
const nodemailer = require('nodemailer')
const saltRounds = 12; // 2^12 = 4096 rounds

const login = async (req, res) => {

    try {
        console.log('inside login')
        const { email, password } = req.body;
        console.log(req.body,"-------")

        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' }); // Stop further execution
        }

        // Check if the user is active
        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'User is not active' });
        }

        

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password); // Don't forget the 'await' here
        if (!isMatch) {
            return res.status(404).json({ success: false, error: 'Wrong password' }); // Stop further execution
        }

        // Generate a JWT token
        const token = jwt.sign(
            { _id: user._id,
                username: user.username,
                email:user.email,
                role: user.role,
                isActive:user.isActive,
                isFirstLogin:user.isFirstLogin
             },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        // Check if the user is loging for the 1st time
        if(user.isFirstLogin){
            return res.status(200).json({ success: false, loginStatus: {status: 'first time login'},user,token });
        }

        // Send the response with the token and user details
        return res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                email:user.email,
                role: user.role,
                isActive:user.isActive,
                isFirstLogin:user.isFirstLogin,
            },
        });
    } catch (error) {
        // Handle server errors
        return res.status(500).json({ success: false, error: error.message });
    }
};


const verify = (req,res) =>{
    console.log("verify user--------",req)
    return res.status(200).json({success: true, user: req.user})
} 

const forgotPassword= async (req, res) => {
    const { email } = req.body;
  
    try {
        const user = await User.findOne({ email });
  
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
  
        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '15m' });
  
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
  
        const resetLink = `http://localhost:5173/reset-password/${user._id}/${token}`;
  
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset your Password',
            text: `Click on the link to reset your password: ${resetLink}`
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email error:", error);
                return res.status(500).json({ success: false, message: "Error sending email" });
            } else {
                return res.json({ success: true, message: "Password reset email sent successfully" });
            }
        });
  
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

 const resetPassword=async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    console.log(req.body,'req.body======-----------')

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (!decoded) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(id, { password: hashedPassword },{ new: true });
        await User.findByIdAndUpdate(id, {isFirstLogin:false},{ new: true });

        res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
  



module.exports= { login, verify,forgotPassword,resetPassword};

