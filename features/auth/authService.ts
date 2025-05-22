import { v4 as uuidv4 } from 'uuid';

// Simulated in-memory storage for users
const users = new Map();

export const registerUser = (username, password, role) => {
  if (users.has(username)) {
    throw new Error('User already exists');
  }
  const userId = uuidv4();
  users.set(username, { userId, password, role });
  return { userId, username, role };
};

export const authenticateUser = (username, password) => {
  const user = users.get(username);
  if (!user || user.password !== password) {
    throw new Error('Invalid username or password');
  }
  return { userId: user.userId, username, role: user.role };
};

export const getUserRole = (username) => {
  const user = users.get(username);
  if (!user) {
    throw new Error('User not found');
  }
  return user.role;
};
