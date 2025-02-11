const API_BASE_URL = 'http://localhost:3001/api'; // adjust to match your backend URL

export const createUserInDatabase = async (email, name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user in database');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};

export const getUserData = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/email/${email}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}; 