import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract user information
 * @param {string} idToken - Google ID token from client
 * @returns {Promise<Object>} User info: { email, name, picture }
 * @throws {Error} If token is invalid or email domain is not allowed
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    console.log('🔍 Starting token verification...');
    console.log('📧 Expected Client ID:', process.env.GOOGLE_CLIENT_ID);
    
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const { email, name, picture } = payload;
    
    console.log('✅ Token verified successfully!');
    console.log('📧 Email:', email);

    // Enforce domain restriction: only @ugrad.iiuc.ac.bd emails allowed
    if (!email || !email.endsWith('@ugrad.iiuc.ac.bd')) {
      console.log('❌ DOMAIN RESTRICTION: Email does not end with @ugrad.iiuc.ac.bd');
      throw new Error('DOMAIN_RESTRICTION');
    }

    console.log('✅ Domain check passed!');

    return {
      email,
      name: name || email.split('@')[0],
      picture: picture || null
    };
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    console.error('❌ Full error:', error);
    
    if (error.message === 'DOMAIN_RESTRICTION') {
      throw new Error('DOMAIN_RESTRICTION');
    }
    throw new Error('Invalid Google token');
  }
};
