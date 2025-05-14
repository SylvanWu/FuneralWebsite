  if (error?.response?.status === 404) {
    // No warning or error for not found
    return null;
  }
  console.error('Error getting funeral room:', error);
  console.error('Error details:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    roomId
  });
  throw error; 