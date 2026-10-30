const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const loginLimiter = require("../middleware/loginLimiter");
const validateRequest = require("../middleware/validateRequest");
const {
  registerValidation, loginValidation, adminLoginValidation, forgotValidation, resetValidation
} = require("../validators/authValidators");

router.post("/register", registerValidation, validateRequest, authController.register);
router.post("/login", loginLimiter, loginValidation, validateRequest, authController.login);
router.post("/admin-login", loginLimiter, adminLoginValidation, validateRequest, authController.adminLogin);
router.post("/forgot-password", loginLimiter, forgotValidation, validateRequest, authController.forgotPassword);
router.post("/reset-password", loginLimiter, resetValidation, validateRequest, authController.resetPassword);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
