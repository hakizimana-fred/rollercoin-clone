import GoogleStrategy from 'passport-google-oauth2'
import passport from 'passport'
import { User } from '../entity/User'
import dotenv from 'dotenv'

dotenv.config()

passport.use(new GoogleStrategy.Strategy({
    clientID: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    callbackURL: '/auth/google/callback',

}, (accessToken, refreshToken, profile, done) => {
    console.log('passport callback fired',)
    console.log(profile)
}
))

