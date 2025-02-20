const API_BASE_URL = 'http://localhost:3001/api'; // adjust to match your backend URL

export const createUserInDatabase = async (email, name) => {
  try {
    console.log('Attempting to create user:', { email, name });
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create user in database');
    }

    const data = await response.json();
    console.log('User created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};

export const getUserData = async (email) => {
  try {
    console.log('Fetching user data for:', email);
    const encodedEmail = encodeURIComponent(email);
    const response = await fetch(`${API_BASE_URL}/users/email/${encodedEmail}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // If user not found, create the user
        console.log('User not found, creating new user...');
        return await createUserInDatabase(email, email.split('@')[0]);
      }
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch user data');
    }

    const data = await response.json();
    console.log('User data fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const updateUserData = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update user data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}; 