import User from "../models/userModel.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

const userController = {
  registerUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await User.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "The email is already registered" });
      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long" });

      const passwordHash = CryptoJS.AES.encrypt(
        password,
        process.env.CRYPTO_SECRET
      );

      const newUser = new User({
        name,
        email,
        password: passwordHash,
      });

      // save
      await newUser.save();
      // create accessToken
      const accessToken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      res.json({ accessToken });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error.message });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User does not exist" });

      const passwordHash = CryptoJS.AES.decrypt(
        user.password,
        process.env.CRYPTO_SECRET
      );
      const decrypted = passwordHash.toString(CryptoJS.enc.Utf8);
      if (decrypted !== password)
        return res.status(400).json({ msg: "Invalid Credentials" });

      const accessToken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      res.json({ accessToken });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "Logged out" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;

      if (!rf_token)
        return res.status(400).json({ msg: "Please Login or Register" });
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "Please Login or Register" });
        const accessToken = createAccessToken({ id: user._id });
        res.json({ accessToken });
      });

      res.json({ rf_token });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User does not exist" });
      res.json(req.user);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

export { userController };
