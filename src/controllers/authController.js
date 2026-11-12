const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Candidate, Invitation, Role, Stack } = require('../models');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

/**
 * Admin / Recruiter login
 * POST /auth/admin/login
 */
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Candidate start via registration or invite token
 * POST /auth/candidate/start
 */
async function candidateStart(req, res) {
  try {
    const { token, name, email, phone, experienceYears } = req.body;

    let candidate = null;
    let presetRole = null;
    let presetStack = null;

    if (token) {
      // Validate invite token
      const invite = await Invitation.findOne({
        where: { token },
        include: [
          { model: Role, as: 'role' },
          { model: Stack, as: 'stack' }
        ]
      });

      if (!invite) {
        return res.status(404).json({ error: 'Invalid invitation token' });
      }

      if (invite.usedAt) {
        return res.status(400).json({ error: 'This invitation token has already been used' });
      }

      if (new Date(invite.expiresAt) < new Date()) {
        return res.status(400).json({ error: 'This invitation token has expired' });
      }

      // Check or create candidate with invitation email
      [candidate] = await Candidate.findOrCreate({
        where: { email: invite.candidateEmail },
        defaults: {
          name: name || invite.candidateEmail.split('@')[0],
          email: invite.candidateEmail,
          phone: phone || null,
          experienceYears: experienceYears || 0
        }
      });

      presetRole = invite.role;
      presetStack = invite.stack;
    } else {
      // Direct registration
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      [candidate] = await Candidate.findOrCreate({
        where: { email },
        defaults: {
          name,
          email,
          phone: phone || null,
          experienceYears: experienceYears ? parseFloat(experienceYears) : 0
        }
      });
    }

    const candidateToken = jwt.sign(
      { candidateId: candidate.id, email: candidate.email, type: 'CANDIDATE' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token: candidateToken,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        experienceYears: candidate.experienceYears
      },
      preset: {
        roleId: presetRole?.id || null,
        stackId: presetStack?.id || null,
        roleName: presetRole?.name || null,
        stackName: presetStack?.name || null
      }
    });
  } catch (error) {
    console.error('Candidate start error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Refresh JWT token
 * POST /auth/refresh
 */
function refreshToken(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    const payload = { ...decoded };
    delete payload.iat;
    delete payload.exp;

    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token: newToken });
  });
}

module.exports = {
  adminLogin,
  candidateStart,
  refreshToken
};

