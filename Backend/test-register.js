async function testRegister() {
  try {
    const res = await fetch('http://localhost:4000/auth/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser12345@example.com',
        password: 'password123',
        role: 'USER'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testRegister();
