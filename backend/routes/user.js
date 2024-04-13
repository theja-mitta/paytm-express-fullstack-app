const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Account } = require("../db");
const {
  validateSignup,
  validateSignin,
  validateUpdatedUserDetails,
} = require("../middleware/validation");
const { authMiddleware } = require("../middleware/auth");
const JWT_SECRET = require("../config");
const router = express.Router();

router.post("/signup", validateSignup, async (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  // Initialize newUser object with request data
  const newUser = new User({
    username,
    firstName,
    lastName,
  });

  let hashedPassword = await newUser.createHash(password);
  newUser.password_hash = hashedPassword;

  // Save newUser object to database
  await newUser.save();

  const userId = newUser._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    token,
  });
});

router.post("/signin", validateSignin, async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ username });

  if (user === null) {
    return res.status(400).json({
      message: "User not found.",
    });
  } else {
    if (await user.validatePassword(password)) {
      const token = jwt.sign(
        {
          userId: user._id,
        },
        JWT_SECRET
      );
      return res.status(200).json({
        message: "User Successfully Logged In",
        token,
      });
    } else {
      return res.status(411).json({
        message: "Error while logging in",
      });
    }
  }
});

router.put(
  "/",
  validateUpdatedUserDetails,
  authMiddleware,
  async (req, res) => {
    await User.updateOne({ _id: req.userId }, req.body);

    res.json({
      message: "Updated successfully",
    });
  }
);

router.get("/bulk", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $and: [ // Use $and to combine conditions
      {
        $or: [
          { firstName: { $regex: filter } },
          { lastName: { $regex: filter } }
        ]
      },
      { _id: { $ne: req.userId } } // Exclude user with _id matching req.userId
    ]
  });

  await User.updateOne({ _id: req.userId }, req.body);

  res.json({
    users: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;
