const express = require("express");
const { createUser, userLogin, addAddress } = require("../controllers/userController");
const authenticateToken = require("../middlewares/auth");
const userRouter = express.Router();
userRouter.use(authenticateToken);
userRouter.post("/address", async (req, res) => {
  try {
    const { userId } = req;
    const { address,markDefault } = req.body;
    if (!address)
      return res.status(400).json({ message: "address is required" });
    const result=await addAddress(userId,address,markDefault);
    res.status(result.status).json({message:result.message})
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
});

module.exports = userRouter;
