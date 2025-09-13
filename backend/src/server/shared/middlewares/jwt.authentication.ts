import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import prismaClient from "../config/prisma.ts";

const secret = process.env.JWT_SECRET;
if(!secret) throw new Error("JWT Secret não foi definido");

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
};

// This will be used for each protected request
passport.use(new JwtStrategy(options, async (payload, done) => {
    try{
        const user = await prismaClient.user.findUnique({
            where: { user_id: payload.sub }
        });

        if(user){
            return done(null, user);
        }
        else{
            return done(null, false);
        }
    }
    catch(error){
        return done(error, false);
    }
}));

export const authenticate = passport.authenticate('jwt', { session: false });