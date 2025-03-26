const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const initFacebookAuth = (app) => {
    // Configure Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_APP_REDIRECT_LOGIN,
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            console.log('Facebook profile:', profile); // Debug log

            // Check if user exists
            let user = await User.findOne({ where: { email: profile.emails[0].value } });

            if (!user) {
                // Create new user if doesn't exist
                user = await User.create({
                    userName: profile.displayName,
                    email: profile.emails[0].value,
                    fullName: profile.displayName,
                    roleid: 1 // Default role for regular users
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || '12b91225bcb26e4186c58c8a0ed615fb',
                { expiresIn: '24h' }
            );

            // Add token to user object
            user.token = token;

            return done(null, user);
        } catch (error) {
            console.error('Facebook auth error:', error);
            return done(error, null);
        }
    }));

    // Serialize user for the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from the session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // Facebook login route
    app.get('/api/auth/facebook',
        passport.authenticate('facebook', { 
            scope: ['email', 'public_profile'],
            display: 'popup'
        })
    );

    // Facebook callback route
    app.get('/auth/facebook/redirect',
        passport.authenticate('facebook', { 
            failureRedirect: 'http://localhost:3000/login',
            session: false
        }),
        (req, res) => {
            // Send success response with user data and token
            res.redirect(`http://localhost:3000/login?success=true&token=${req.user.token}`);
        }
    );
};

const verifyFacebookToken = async (req, res) => {
    try {
        const { accessToken, userData } = req.body;

        // Verify the access token with Facebook
        const response = await axios.get(`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`);
        
        if (response.data.id !== userData.id) {
            return res.status(401).json({ error: 'Invalid Facebook token' });
        }

        // Check if user exists
        let user = await User.findOne({ where: { email: userData.email } });

        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                userName: userData.name,
                email: userData.email,
                fullName: userData.name,
                roleid: 1 // Default role for regular users
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user data and token
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                userName: user.userName,
                email: user.email,
                fullName: user.fullName,
                roleid: user.roleid
            }
        });
    } catch (error) {
        console.error('Facebook verification error:', error);
        res.status(500).json({ error: 'Facebook verification failed' });
    }
};

module.exports = {
    initFacebookAuth,
    verifyFacebookToken
}; 