// server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');




dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.get('*',(req,res)=>{res.sendFile(path.join(__dirname, 'build','index.html'))})
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('src'));
app.use(express.static('public'));



// MongoDB URI
const mongoURI = process.env.MONGODB_URI;
const publicKey = process.env.MONGODB_PUBLIC_KEY;
const privateKey = process.env.MONGODB_PRIVATE_KEY;
const projectId = process.env.MONGODB_PROJECT_ID;





// IP whitelisting(Error 401 not working)
const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto
    .createHmac('sha256', privateKey)
    .update(`${timestamp}${publicKey}`)
    .digest('hex');

async function whitelistCurrentIP() {
    try {
        const response = await axios.get('https://ipinfo.io');
        const ip = response.data.ip;

        const authHeader = `Basic ${Buffer.from(`${publicKey}:${privateKey}`).toString('base64')}`;

        const whitelistResponse = await axios.post(
            `https://cloud.mongodb.com/api/atlas/v1.0/groups/${projectId}/accessList`,
            {
                ipAddress: ip,
                comment: "Dynamic IP Address"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `MongoDB ${publicKey}:${signature}:${timestamp}`
                }
            }
        );

        console.log('IP address whitelisted successfully:', ip);
    } catch (err) {
        console.error('Failed to whitelist IP address:', err.response ? err.response.data : err.message);
    }
}

whitelistCurrentIP().then(() => {
    mongoose.connect(mongoURI, {
        useUnifiedTopology: true 
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch((error) => {
        console.error('Failed to connect to MongoDB:', error.message);
    });
});

//IP whitelist end



// Connect to MongoDB
mongoose.connect(mongoURI)
     .then(() => {
         console.log('Connected to MongoDB');
     })
     .catch((err) => {
         console.error('Failed to connect to MongoDB:', err.message);
     });





    
    //Configure session middleware
    app.use(session({
        secret: '8401288309', 
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions'
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    }));

//login backend code start
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'myprofile.html'));
});



     app.post('/login', async (req, res) => {
        try {
            console.log("Login request received.");
            
            console.log("Full request body:", req.body);
    
            const { email, password } = req.body;
    
            if (!email) {
                console.log("Email not provided.");
                return res.status(400).send('Please provide both email and password.');
            }

            if (!password) {
                console.log("password not provided.");
                return res.status(400).send('Please provide both email and password.');
            }

            // Check if it's an admin login
            if (email === adminCredentials.email && password === adminCredentials.password) {
            const token = jwt.sign({ email, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
            return res.cookie('token', token, { httpOnly: true }).json({ role: 'admin' });
            }
    
            console.log("Login data received:", { email });
    
            const user = await User.findOne({ email });
            
            if (!user) {
                console.log("User not found with email:", email);
                return res.status(400).send('Invalid email or password.');
            }
            console.log("User found:", user);
    
            
            if (!(password === user.password)) {
                console.log("Password mismatch for user:", email);
                return res.status(400).send('Invalid email or password.');
            }
            console.log("Password match confirmed for user:", email);
    
            // Create session
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.email = user.email,
            console.log("Session created for user:", req.session);
            res.status(201).redirect('/index.html');
           // res.status(200).send('Login successful.');
        } catch (error) {
            console.error("Error during login process:", error);
            res.status(500).send('An error occurred during login.');
        }
    });
    
//login backend code end
    
//sign up page backend code start

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    medicalConditions: String,
    medications: String,
    allergies: String,
    emergencyContact: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/api/signup', async (req, res) => {
    console.log('Received signup request:', req.body);

    try {
        const { password, ...userData } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const newUser = new User({ ...userData, password: hashedPassword });
        await newUser.save();

        console.log('User saved successfully:', {
            username: newUser.username,
            email: newUser.email,
            name: `${newUser.firstName} ${newUser.lastName}`
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser._id
        });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(400).json({
            message: 'Error creating user',
            error: error.message
        });
    }
});

// Serve signup page for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

//Sign up page backend code end


// Profile API, profile page backend code start
app.get('/api/profile', async (req, res) => {
    try {
        const userEmail = req.session.email;
        if (!userEmail) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        const user = await User.findOne({ email: userEmail }, '-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//profile page backend code end

//admin page backend code start
// Secret key for JWT
const SECRET_KEY = '1234567890';

// Middleware for private route authentication
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
}

// Admin credentials
const adminCredentials = {
  email: 'admin@email.com',
  password: 'adminSH25',
};

// Login route for admin
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === adminCredentials.email && password === adminCredentials.password) {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Logout route
app.post('/admin/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
});

// Route: Fetch All Users and Render on HTML Page
app.get("/admin", async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all documents
        console.log("Fetched Users:", users); // Log users to the server console
        res.render("admin", { users }); // Pass users data to EJS template
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Update user by email
app.put('/api/users/:email', async (req, res) => {
    try {
        const userEmail = req.params.email; // Get email from URL parameter
        const updates = req.body;          // Get updates from request body
        console.log("user email found.");
        const user = await User.findOneAndUpdate({ email: userEmail }, updates, { new: true });

        if (user) {
            res.status(200).json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});




//Admin page backend code end


// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('An error occurred during logout.');
        }
        res.clearCookie('connect.sid'); // clears the session cookie
        res.send('Logout successful.');
    });
});






const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
