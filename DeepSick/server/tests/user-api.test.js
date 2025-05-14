import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../index.js'; // App instance needs to be exported from index.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';

describe('User API Tests', () => {
  let testUser;
  let testToken;
  let testUserId;

  // Setup before tests
  beforeAll(async () => {
    try {
      // Connect to test database
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/memorial_test');
      }

      // Create test user and save to database
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      });

      await testUser.save();
      testUserId = testUser._id;

      // Generate test token
      testToken = jwt.sign(
        { id: testUser._id, username: testUser.username, role: testUser.role },
        process.env.JWT_SECRET || 'your_test_secret',
        { expiresIn: '1h' }
      );
    } catch (error) {
      console.error('Error setting up test environment:', error);
    }
  });

  // Cleanup after tests
  afterAll(async () => {
    try {
      // Delete test user
      await User.deleteOne({ _id: testUserId });

      // Close database connection
      if (mongoose.connection.readyState) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.error('Error cleaning up test environment:', error);
    }
  });

  // Test user registration
  describe('POST /api/users/register', () => {
    it('successfully registers a new user', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', newUser.username);
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).toHaveProperty('role', newUser.role);
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned

      // Cleanup: remove test user
      await User.deleteOne({ username: newUser.username });
    });

    it('fails to register with existing username', async () => {
      const existingUser = {
        username: 'testuser', // Already exists
        email: 'another@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test user login
  describe('POST /api/users/login', () => {
    it('successfully logs in with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', testUser.username);
    });

    it('fails to login with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('fails to login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test get user profile
  describe('GET /api/users/profile', () => {
    it('successfully retrieves user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('fails to retrieve user profile when no token is provided', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('fails to retrieve user profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test update user profile
  describe('PUT /api/users/profile', () => {
    it('successfully updates user profile', async () => {
      const updatedData = {
        username: 'updatedtestuser',
        bio: 'This is a test bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', updatedData.username);
      expect(response.body).toHaveProperty('bio', updatedData.bio);

      // Restore username
      await User.findByIdAndUpdate(testUserId, { username: 'testuser' });
    });

    it('cannot update user profile when unauthorized', async () => {
      const updatedData = {
        username: 'hackerman',
        bio: 'Attempting unauthorized update'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .send(updatedData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 