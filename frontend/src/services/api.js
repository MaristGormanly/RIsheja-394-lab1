const API_BASE_URL = 'http://localhost:3001/api'; // adjust to match your backend URL

export const createUserInDatabase = async (email, name) => {
  try {
    console.log('Attempting to create user:', { email, name });
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create user in database');
    }

    return data;
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};

export const getUserData = async (email) => {
  try {
    console.log('Fetching user data for:', email);
    const response = await fetch(`${API_BASE_URL}/email/${email}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user data');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}; 