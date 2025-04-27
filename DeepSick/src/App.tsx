import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadArea from './components/UploadArea'
import Timeline, { Memory } from './components/Timeline'
import './App.css'
import { fetchMemories, createMemory, deleteMemory } from './api/index.ts'

// Update Memory interface to match backend model
export interface BackendMemory {
  _id: string;
  uploaderName: string;
  uploadTime: string;
  memoryType: 'image' | 'video' | 'text';
  memoryContent: string;
}

function App() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [name, setName] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Fetch memories from backend
  useEffect(() => {
    const getMemories = async () => {
      try {
        const { data } = await fetchMemories();
        // Convert backend data to frontend format
        const formattedMemories = data.map((memory: BackendMemory) => ({
          id: memory._id,
          type: memory.memoryType,
          preview: memory.memoryContent,
          uploadTime: new Date(memory.uploadTime),
          uploaderName: memory.uploaderName
        }));
        setMemories(formattedMemories);
      } catch (error) {
        console.error('Failed to fetch memories:', error);
      }
    };

    getMemories();
  }, []);

  const handleFileUpload = async (file: File) => {
    // Prevent duplicate uploads
    if (isUploading) return;
    
    try {
      setIsUploading(true);
      
      let type: 'image' | 'video' | 'text' = 'image'
      let preview = ''
      let memoryContent = ''

      if (file.type.startsWith('image/')) {
        type = 'image'
        preview = URL.createObjectURL(file)
        memoryContent = URL.createObjectURL(file) // Temporary URL for display
      } else if (file.type.startsWith('video/')) {
        type = 'video'
        preview = URL.createObjectURL(file)
        memoryContent = URL.createObjectURL(file) // Temporary URL for display
      } else if (file.type === 'text/plain') {
        type = 'text'
        const text = await file.text()
        preview = text.substring(0, 500) + (text.length > 500 ? '...' : '')
        memoryContent = text
      }

      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploaderName', name || 'Anonymous User');
      formData.append('memoryType', type);
      
      // If text, set content directly
      if (type === 'text') {
        formData.append('memoryContent', memoryContent);
      }

      // Send to backend
      const response = await createMemory(formData);
      
      const newMemory: Memory = {
        id: response.data._id,
        type,
        preview,
        uploadTime: new Date(),
        uploaderName: name || 'Anonymous User'
      }

      // Use function form of setState to avoid using stale state
      setMemories(prevMemories => [newMemory, ...prevMemories]);
    } catch (error) {
      console.error('Failed to upload memory:', error);
    } finally {
      setIsUploading(false);
    }
  }

  const handleDeleteMemory = async (id: string) => {
    console.log("App: handleDeleteMemory called for ID:", id);
    try {
      await deleteMemory(id);
      console.log("API call successful, removing memory from state");
      setMemories(prevMemories => prevMemories.filter(memory => memory.id !== id));
    } catch (error) {
      console.error('Failed to delete memory:', error);
      alert('Failed to delete memory. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center">
          <span className="text-xl font-bold">88</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-700 hover:text-gray-900">Products</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Solutions</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Community</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Resources</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Pricing</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Contact</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Link</a>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-1 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">Sign in</button>
          <button className="px-4 py-1 bg-gray-800 text-white rounded-lg">Register</button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="md:flex md:items-center md:space-x-6 mb-10">
          {/* Left image */}
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img 
              src="/Hall.png" 
              alt="Digital Memorial Hall" 
              className="w-full rounded-lg shadow-md"
            />
          </div>
          {/* Right content */}
          <div className="md:w-1/2">
            <Header />
          </div>
        </div>

        <main className="max-w-4xl mx-auto">
          {/* Name input */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <UploadArea onFileUpload={handleFileUpload} />
          <Timeline 
            memories={memories} 
            onDeleteMemory={handleDeleteMemory}
          />
        </main>
      </div>
    </div>
  )
}

export default App
