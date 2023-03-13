import bigPromise from "../middlewares/bigPromise.js"
import Stripe from "stripe"
import Razorpay from 'razorpay';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// capture key
export const sendStripeKey = bigPromise(async(req,res,next)=>{
    res.status(201).json({
        stripeKey:process.env.STRIPE_API_KEY
    })
})

export const sendRazorpayKey = bigPromise(async(req,res,next)=>{
    res.status(201).json({
        razorpayKey:process.env.RAZORPAY_API_KEY
    })
})

// capture/accept payments
export const captureStripePayment = bigPromise(async(req,res,next)=>{
    // console.log(stripe)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        // optional
        metadata : {integration_check : "accept_a_payment"},
        // console.log("check")
      });
      console.log(paymentIntent)

      res.status(201).json({
        success:true,
        client_secret:paymentIntent.client_secret
        // you can send id as well 
      })

})

export const captureRazorpayPayment = bigPromise(async(req,res,next)=>{
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY,
        key_secret:process.env.RAZORPAY_SECRET_KEY })

    // explore nano id
    var options = {
        amount: req.body.amount,
        currency: "INR",
    }

    const myOrder = await  instance.orders.create(options)

    res.status(201).json({
        success:true,
        amount:req.body.amount,
        order:myOrder
    })
})