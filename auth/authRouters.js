
const passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy;
const jsonWebToken = require('jsonwebtoken');
const keys = require('../config/keys');
module.exports = (app, db) => {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
    passport.use(new GitHubStrategy({
        clientID: keys.clientID,
        clientSecret: keys.clientSecret,
        callbackURL: "/auth/github/callback"
    },
        function (accessToken, refreshToken, profile, done) {
            const tempObj = {
                accessToken,
                _id: profile.id,
                displayName: profile.displayName,
                userName: profile.username,
                email: profile.emails[0].value,
                photoUrl: profile.photos[0].value,
                profileUrl: profile.profileUrl,
            }
            let jsonActionToken = jsonWebToken.sign(tempObj, keys.jwtSecret, {
                expiresIn: 3600 * 24 * 365
            });
            tempObj['jwtToken'] = jsonActionToken;
            tempObj.history = [];
            db.collection("users").findOne({}, { _id: profile.id }).then((result) => {
                if (!result) {
                    db.collection("users").insertOne(tempObj).then((result) => {
                        done(null, result);
                    }).catch(err => {
                        console.log("failed during insert");
                        done(err);
                    })
                } else {
                    done(null, result);
                }

            }).catch(err => {
                done(err);
            })
        }
    ));
    /* GITHUB ROUTER */
    app.get('/auth/github',
        passport.authenticate('github', { scope: ['repo', 'admin:public_key'] }));

    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/');
        });

    /* GET users listing. */
    app.get('/login', function (req, res, next) {
        console.log("redirect to login");
    });
    app.get('/logout', function (req, res) {
        // its going to kill current session with the help of passport js and clear cookie
        req.logout();
        res.redirect('/');
    });
}
