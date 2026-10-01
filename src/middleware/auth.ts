import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';

export interface MasrofUser {
  uid: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
  isDemo?: boolean;
}

export interface AuthRequest extends Request {
  user?: MasrofUser;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const isDemoHeader = req.headers['x-demo-mode'] === 'true';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Handle Demo mode token securely and isolated
  if (token === 'demo-session-token' || isDemoHeader) {
    const demoUser: MasrofUser = {
      uid: 'demo-user-masrof-id',
      email: 'demo@masrof.app',
      displayName: 'Demo Account',
      photoUrl: null,
      isDemo: true,
    };
    req.user = demoUser;
    try {
      await getOrCreateUser({
        uid: demoUser.uid,
        email: demoUser.email,
        displayName: demoUser.displayName,
      });
      return next();
    } catch (err) {
      console.error('Failed to init demo user in db:', err);
      return res.status(500).json({ error: 'Failed to initialize session' });
    }
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const user: MasrofUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || `${decodedToken.uid}@masrof.app`,
      displayName: decodedToken.name || null,
      photoUrl: decodedToken.picture || null,
      isDemo: false,
    };

    req.user = user;
    await getOrCreateUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
    });

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
