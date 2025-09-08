import Transaction from "../models/Transaction.js"
import Stripe from "stripe"

const plans = [
     {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]

//API controller for getting all plans 
export const getPlans = async (req, res) => {
    try {
        res.json({success: true, plans})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//API controller for purchasing a plan 
export const purchasePlan = async (req, res) => {
    console.log('=== PURCHASE PLAN STARTED ===');
    
    try {
        // First, let's just test basic response
        console.log('Step 1: Basic test');
        console.log('Request body:', req.body);
        console.log('User:', req.user ? req.user._id : 'NO USER');
        
        // Test if we can send a response at all
        console.log('Step 2: Testing basic response...');
        // Test passed! Now running real Stripe code...
        
        const {planId} = req.body
        const userId = req.user._id
        
        console.log('Plan ID:', planId);
        console.log('User ID:', userId);
        
        if (!planId) {
            console.log('Missing plan ID');
            return res.json({success: false, message: "Plan ID is required"})
        }
        
        const plan = plans.find(plan => plan._id === planId)
        console.log('Found plan:', plan);

        if(!plan) {
            console.log('Plan not found');
            return res.json({success: false, message: "Invalid plan"})
        }

        // Check Stripe key
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY not found in environment');
            return res.json({success: false, message: "Payment service not configured"})
        }

        //Create new transaction
        console.log('Creating transaction...');
        const transaction = await Transaction.create({
            userId: userId, 
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })
        
        console.log('Transaction created:', transaction._id);

        const {origin} = req.headers;
        console.log('Request origin:', origin);

        // Create Stripe session
        console.log('Creating Stripe session...');
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: plan.price * 100,
                        product_data: {
                            name: plan.name
                        }
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/loading`,
            cancel_url: `${origin}/`,
            metadata: {
                transactionId: transaction._id.toString(), 
                appId: 'quickgpt'
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });

        console.log('Stripe session created successfully');
        console.log('Session ID:', session.id);
        console.log('Session URL:', session.url);

        res.json({success: true, url: session.url})

    } catch (error) {
        console.error('=== PURCHASE PLAN ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Make sure we always send a response
        res.status(500).json({success: false, message: error.message})
    }
}