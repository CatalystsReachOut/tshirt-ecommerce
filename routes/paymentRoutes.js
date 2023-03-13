import express from "express"
import { captureRazorpayPayment, captureStripePayment, sendRazorpayKey, sendStripeKey } from "../controllers/paymentController.js"
const router = express.Router()

// payment controller


// import middlewares 
import { isLoggedIn } from "../middlewares/userMiddlewares.js"

// payment routes
router.route("/stripeKey").get(isLoggedIn, sendStripeKey)
router.route("/razorpayKey").get(isLoggedIn, sendRazorpayKey)
router.route("/captureStripe").post(isLoggedIn, captureStripePayment)
router.route("/captureRazorpay").post(captureRazorpayPayment)
 
export default router;