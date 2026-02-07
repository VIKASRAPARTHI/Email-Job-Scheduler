import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Router } from "express";


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj: any, done) => {
    done(null, obj);
});


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_ID",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER_SECRET",
            callbackURL: "http://localhost:4000/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {

            const user = {
                name: profile.displayName,
                email: profile.emails?.[0].value,
                picture: profile.photos?.[0].value,
                token: accessToken
            };
            return done(null, user);
        }
    )
);

const router = Router();


router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        const user = req.user as any;



        const userData = encodeURIComponent(JSON.stringify(user));
        res.redirect(`http://localhost:3000/auth-success?user=${userData}`);
    }
);

export default router;
