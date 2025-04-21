const bcrypt = require('bcrypt');
const UserRepository = require('../repositories/userRepository');
const nodemailer = require("nodemailer");
class UserService {

  constructor() {
    this.userRepository = new UserRepository();
  }


  async sendEmail(email, fullName) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Account Created Successfully",
        text: `Hello ${fullName},\n\nYour account has been created successfully!\n\nEnter random password and login to change the password.\n\nBest Regards,\nRMS.`,
      };
      console.log(mailOptions,"email sent succesfully")

      await transporter.sendMail(mailOptions);

    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
  // Business logic for creating a user
  async createUser(userData) {
  
    const { password, ...rest } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userDataWithHashedPassword = { ...rest, password: hashedPassword };

    let newUser=await this.userRepository.createUser(userDataWithHashedPassword);
 


    // Save to Manager or Artist collection based on role by calling repository methods
    if (newUser.role === 'Manager') {
      const managerData = { managerId: newUser._id, username:newUser.username, email:newUser.email, ...rest };
      await this.userRepository.createManager(managerData);
    } else if (newUser.role === 'Artist') {
  
      const artistData = { artistId: newUser._id, username:newUser.username, email:newUser.email, ...rest };
     
      await this.userRepository.createArtist(artistData);
    }
    await this.sendEmail(newUser.email, newUser.username);

    return newUser;
  }

  // Business logic for getting user profile
  async getUserProfileByUsername(username) {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const userProfile = await this.userRepository.findUserProfileByRole(user._id, user.role);
    if (!userProfile) {
      throw new Error(`${user.role} details not found`);
    }

    return userProfile;
  }

  // Business logic for updating user details
  async updateUserProfile(username, updateData) {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedProfile = await this.userRepository.updateUserProfile(user._id, user.role, updateData);
    if (!updatedProfile) {
      throw new Error(`${user.role} details not found`);
    }

    return updatedProfile;
  }

  // Business logic for deleting a user
  async deleteUser(username) {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.deleteUser(user._id, user.role);
    return true;
  }

  // Business logic for getting all users by role
  async getAllUsers(role) {
    return await this.userRepository.getAllUsersByRole(role);
  }

  async toggleUserStatus(userId, isActive) {
    const user = await this.userRepository.updateUserStatusById(userId, isActive);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

}

module.exports = UserService;
