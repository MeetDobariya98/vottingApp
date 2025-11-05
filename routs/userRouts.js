const express = require('express');
const router = express.Router();
const User = require('./../models/user'); // Capitalized model name
const { jwtAuthMiddleware, generateToken } = require('./../jwt');



// POST route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        // Create a new person document using the Mongoose model
        const newUser = new User(data);

        // Save the new person
        const response = await newUser.save();
        console.log('Data saved successfully');

        const payload = {
            id: response.id
        }
        const token = generateToken(payload)
        console.log("token is : ", token);
        console.log("payload is : ", payload);

        res.status(200).json({ response: response, token: token });
    }
    catch (err) {
        console.error('Error saving person:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//loging router
router.post('/login', async (req, res) => {
    try {
        //extract username and password from request body
        const { aadharCardNumber, password } = req.body;

        //find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        //if user does not exits or password does not matc,return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "invalid username or password" })
        }

        //generate tokens
        const payload = {
            id: user.id
        }
        const token = generateToken(payload)

        //return token as response
        res.json({ token })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "invalid server error" })
    }
})

//profile routs
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({ user })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal server error" })
    }
})

//post method
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user;//extract the id from the  token 
        const { currentPassword, newPasssword } = req.body//extract current and new password from request body

        //find the user by userId
        const user = await User.findById(userId);

        //if password does not match,return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: "invalid username or password" })
        }

        //update the user password
        user.password=newPasssword;
        await user.save();

        console.log("data updated");
        res.status(200).json({error: 'inetrnal server error'})
    }
    catch {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


module.exports = router;