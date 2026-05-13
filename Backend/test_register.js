import axios from 'axios';

const test = async () => {
  try {
    const res = await axios.post('http://127.0.0.1:5050/auth/users', {
      role: 'USER',
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser456@example.com',
      password: 'password123'
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data);
  }
};

test();
