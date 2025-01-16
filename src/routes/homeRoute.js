const express = require("express");
const router = express.Router();
const path=require("path");
router.route("/").get((_, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

module.exports = router;
