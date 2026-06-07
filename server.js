import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import { testConnection } from './src/models/db.js';
import { ensureAdminUserExists } from './src/models/users.js';
import router from './src/routes.js';
import flash from './src/middleware/flash.js';

// Define the the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

// Load session secret from environment variables
const SESSION_SECRET = process.env.SESSION_SECRET;
const DB_URL = process.env.DB_URL;

if (!SESSION_SECRET) {
    console.error('FATAL: SESSION_SECRET environment variable is required.');
    process.exit(1);
}

if (!DB_URL) {
    console.error('FATAL: DB_URL environment variable is required.');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Required when running behind Render's HTTPS proxy (for sessions/cookies)
app.set('trust proxy', 1);

/**
  * Configure Express middleware
  */

// Set up session management
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000, // Session expires after 1 hour of inactivity
        secure: NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Use flash message middleware
app.use(flash);

// Allow Express to receive and process common POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

// Middleware to log all incoming requests
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); // Pass control to the next middleware or route
});

// Middleware to make NODE_ENV, login state, and user data available to all templates
app.use((req, res, next) => {
    res.locals.isLoggedIn = false;
    res.locals.user = null;

    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user;
    }

    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// Use the imported router to handle routes
app.use(router);

// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    // Log error details for debugging
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    
    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };
    
    // Render the appropriate error template
    res.status(status).render(`errors/${template}`, context, (renderErr) => {
        if (renderErr) {
            console.error('Error rendering error page:', renderErr.message);
            res.status(status).send(status === 404 ? 'Page Not Found' : 'Server Error');
        }
    });
});

app.listen(PORT, async () => {
  try {
    await testConnection();
    await ensureAdminUserExists();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
