const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  findUserByEmail,
  findUserById,
  checkEmailExists,
  createMainAccount,
  createSubUser,
  getAllUsers,
  getUsersByMainAccount,
  updateUser,
} = require('../Models/usersModel');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'payrollApi';

/**
 * User Login with bcrypt password verification
 */
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required',
    });
  }

  try {
    const users = await findUserByEmail(email);

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'Account is not active',
      });
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: user.type,
        role_id: user.role_id,
        main_account_id: user.main_account_id,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Return user info (no password)
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        type: user.type,
        role_id: user.role_id,
        phone: user.phone,
        status: user.status,
        main_account_id: user.main_account_id,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Register Main Account (Public endpoint)
 */
const registerMainAccount = async (req, res) => {
  const { full_name, email, phone, password, type } = req.body;

  // Validation
  if (!full_name || !email || !password || !type) {
    return res.status(400).json({
      status: 'error',
      message: 'Full name, email, password, and type are required',
    });
  }

  // Validate type
  const validTypes = ['buyer', 'seller', 'admin'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      status: 'error',
      message: 'Type must be buyer, seller, or admin',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email format',
    });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 8 characters long',
    });
  }

  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create main account
    const userData = {
      type,
      full_name,
      email,
      phone: phone || null,
      password: hashedPassword,
    };

    const result = await createMainAccount(userData);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        id: result.insertId,
        full_name,
        email,
        type,
        role_id: 'OWNER',
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Create Sub-User (Protected endpoint - OWNER only)
 */
const createSubUserAccount = async (req, res) => {
  const { full_name, email, phone, password, role_id } = req.body;
  const parentUserId = req.user.id; // From JWT middleware

  // Validation
  if (!full_name || !email || !password || !role_id) {
    return res.status(400).json({
      status: 'error',
      message: 'Full name, email, password, and role_id are required',
    });
  }

  // Validate role_id is not OWNER
  if (role_id === 'OWNER') {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot create sub-user with OWNER role',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email format',
    });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 8 characters long',
    });
  }

  try {
    // Get parent user info
    const parentUsers = await findUserById(parentUserId);
    if (parentUsers.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Parent user not found',
      });
    }

    const parentUser = parentUsers[0];

    // Check if parent is OWNER
    if (parentUser.role_id !== 'OWNER') {
      return res.status(403).json({
        status: 'error',
        message: 'Only OWNER can create sub-users',
      });
    }

    // Check if parent is a main account (not a sub-user)
    if (parentUser.main_account_id !== null) {
      return res.status(403).json({
        status: 'error',
        message: 'Sub-users cannot create other sub-users',
      });
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create sub-user with inherited type
    const userData = {
      type: parentUser.type, // Inherit parent's type
      role_id,
      full_name,
      email,
      phone: phone || null,
      password: hashedPassword,
      main_account_id: parentUserId,
    };

    const result = await createSubUser(userData);

    res.status(201).json({
      status: 'success',
      message: 'Sub-user created successfully',
      data: {
        id: result.insertId,
        full_name,
        email,
        type: parentUser.type,
        role_id,
        main_account_id: parentUserId,
      },
    });
  } catch (err) {
    console.error('Sub-user creation error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get all users (Admin or authenticated users)
 */
const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get sub-accounts for logged-in user
 */
const getMySubAccounts = async (req, res) => {
  const userId = req.user.id;

  try {
    const subUsers = await getUsersByMainAccount(userId);

    res.status(200).json({
      status: 'success',
      data: subUsers,
    });
  } catch (err) {
    console.error('Get sub-accounts error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Update User Details
 */
const updateUserDetails = async (req, res) => {
  const userId = req.params.id;
  const { full_name, email, phone, status, password, type } = req.body;

  // Validation
  if (!full_name || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'Full name and email are required',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email format',
    });
  }

  try {
    // Check if user exists
    const users = await findUserById(userId);
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const currentUser = users[0];

    // Check if email is changing and if it already exists for another user
    if (email !== currentUser.email) {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists',
        });
      }
    }

    let hashedPassword = null;
    if (password && password.trim() !== '') {
      if (password.length < 8) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 8 characters long',
        });
      }
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updateData = {
      full_name,
      email,
      phone: phone || null,
      status: status || currentUser.status,
      password: hashedPassword,
    };

    await updateUser(userId, updateData);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

module.exports = {
  userLogin,
  registerMainAccount,
  createSubUserAccount,
  getUsers,
  getMySubAccounts,
  updateUserDetails,
};
