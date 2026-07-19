import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import passport from './passport.js';
import attributesRouter from './routes/attributes.js';
import positionsRouter from './routes/positions.js';
import cvsRouter from './routes/cvs.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use('/attributes', attributesRouter);
app.use('/positions', positionsRouter);
app.use('/cvs', cvsRouter);

const port = process.env.PORT || 4000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Google login
app.get('/auth/google', passport.authenticate('google', {
  session: false,
  scope: ['profile', 'email'],
}));

// Google redirects back here after login
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Start GitHub login
app.get('/auth/github', passport.authenticate('github', {
  session: false,
  scope: ['user:email'],
}));

// GitHub redirects back here after login
app.get('/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});