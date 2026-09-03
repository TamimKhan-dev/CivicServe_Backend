import bcrypt from "bcryptjs";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  type Profile,
  type VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "../lib/prisma";
import config from ".";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          return done(null, false, {
            message: "User not found!",
          });
        }

        if (user.deletedAt) {
          return done(null, false, {
            message: "This account has been Deleted!",
          });
        }

        if (user.status === "SUSPENDED") {
          return done(null, false, {
            message: "This account has been Suspended!",
          });
        }

        if (!user.password) {
          return done(null, false, {
            message:
              "Invalid email or password!",
          });
        }

        const isPasswordMatched = await bcrypt.compare(
          password,
          user.password,
        );

        if (!isPasswordMatched) {
          return done(null, false, {
            message: "Invalid password, Please try again!",
          });
        };

        if (!user.emailVerified) {
            return done(null, false, { 
                message: "This Email is not verified, you have to verify first then you can login!"
            })
        };

        return done(null, user);
      } catch (error: any) {
        done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: config.google_client_callback_url,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      const email = profile.emails?.[0].value;

      if (!email) {
        return done(null, false, {
          message: "Google account email not available!",
        });
      }

      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: profile.displayName,
            email,
            profileImage: profile.photos?.[0].value,
            googleId: profile.id,
            emailVerified: true,
          },
        });

        return done(null, user);
      }

      if (user.deletedAt) {
        return done(null, false, {
          message: "Your account has been Deleted!",
        });
      }

      if (user.status === "SUSPENDED") {
        return done(null, false, {
          message: "Your account has been Suspended!",
        });
      }

      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId: profile.id },
        });

        return done(null, user);
      }

      return done(null, user);
    },
  ),
);
