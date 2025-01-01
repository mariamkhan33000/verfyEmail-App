import bcrypt from 'bcryptjs'
import User from '../model/user.js'
import generateJWTToken from '../utils/generateJWTToken.js';
import { generateVerificationToken } from '../utils/generateVerificationToken.js';
import sendVerificationEmail, { sendWelcomeEmail } from '../resend/email.js';

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
          }
          const userAlreadyExists = await User.findOne({ email });
          if (userAlreadyExists) {
            return res.status(400).json({ message: "User already exists" });
          }
      
          const hashedPassword = await bcrypt.hash(password, 10);
          const verificationToken = generateVerificationToken();
          const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          });

          await user.save();

          generateJWTToken(res, user._id)

          await sendVerificationEmail(user.email, verificationToken)

          res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
              ...user._doc,
              password: undefined,
            },
          });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }
      const isVerified = user.isVerified;
      if (!isVerified) {
        return res
          .status(400)
          .json({ success: false, message: "Email not verified" });
      }
  
      generateJWTToken(res, user._id);
  
      res.status(200).json({
        success: true,
        message: "Login successful",
      });
    } catch (error) {
      console.log("error logging in", error);
      res.status(400).json({ success: false, message: error.message });
    }
  };


  export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  };


  export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
      const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      })
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code",
        });
      }
      user.isVerified = true,
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined
      await user.save()

      await sendWelcomeEmail(user.email, user.name)

      res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.log("error verifying email", error);
    res.status(400).json({ success: false, message: error.message });
    }
  }