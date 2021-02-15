import GoogleStrategy from 'passport-google-oauth2'
import passport from 'passport'
import { User } from '../entity/User'

passport.use(new GoogleStrategy.Strategy({
    clientID: 'agoueaouge',
    clientSecret: 'oaugoeuaogue',
    callbackURL: 'aogueoaugeou',
}, (accessToken, refreshToken, profile, done) => {
    console.log('passport callback fired',)
    console.log(profile)
}
))
