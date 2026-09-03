import passport from "passport";
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from "passport-google-oauth20"
import { prisma } from "../lib/prisma";
import config from ".";

passport.use(
    new GoogleStrategy({
        clientID: config.google_client_id,
        clientSecret: config.google_client_secret,
        callbackURL: config.google_client_callback_url
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        const email = profile.emails?.[0].value

        if (!email) {
            return done(null, false, {
                message: "Google account email not available!"
            })
        };

        let user = await prisma.user.findUnique({
            where: {
                email,
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: profile.displayName,
                    email,
                    profileImage: profile.photos?.[0].value,
                    googleId: profile.id,
                    emailVerified: true
                }
            });

            return done(null, user);
        };

        if (user.deletedAt) {
            return done(null, false, {
                message: "Your account has been Deleted!"
            })
        };

        if (user.status === "SUSPENDED") {
            return done(null, false, {
                message: "Your account has been Suspended!"
            })
        };

        if (!user.googleId) {
            user = await prisma.user.update({
                where: { email },
                data: { googleId: profile.id }
            });

            return done(null, user);
        };
        

        return done(null, user);
    })
)