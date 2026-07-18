import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: profile.displayName },
  });
  done(null, user);
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value ?? `${profile.username}@github.local`;
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: profile.displayName || profile.username },
  });
  done(null, user);
}));

export default passport;