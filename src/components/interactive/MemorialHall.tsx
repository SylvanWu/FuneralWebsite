  if (userStr) {
    const user = JSON.parse(userStr);
    setUserRole(user.userType);
  } else {
    // If there is no user object, try to get from role
    const roleStr = localStorage.getItem('role');
    setUserRole(roleStr);
  }

  // Prevent the file from being too large
  if (file.size > 10 * 1024 * 1024) {
    setUploadError('File is too large, please upload files smaller than 10MB');
    setIsUploading(false);
    return;
  }

  try {
    // Do not remove the local preview to allow users to see the uploaded content, but mark it as "local".
    setMemories(prev =>
      prev.map(m => m.id === tempId ? {
        ...m,
        uploaderName: `${m.uploaderName} (Local preview)`
      } : m)
    );
  } catch (err) {
    console.error('Preprocessing upload failed:', err);
    setUploadError((err as Error).message || 'Upload failed, please try again.');
  } finally {
    setIsUploading(false);
  }

  // Skip deleting the temporary memory
  if (id.startsWith('temp-')) {
    setMemories(prev => prev.filter(m => m.id !== id));
    return;
  }

  alert('Delete failed, please try again');

  // Check if user is organizer or admin
  const isOrganizer = userRole === 'organizer' || userRole === 'admin';
} 