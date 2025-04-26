import React, { useState } from 'react'
import Header from './components/Header'
import UploadArea from './components/UploadArea'
import Timeline, { Memory } from './components/Timeline'
import './App.css'

function App() {
  const [memories, setMemories] = useState<Memory[]>([])

  const handleFileUpload = async (file: File) => {
    let type: 'image' | 'video' | 'text' = 'image'
    let preview = ''

    if (file.type.startsWith('image/')) {
      type = 'image'
      preview = URL.createObjectURL(file)
    } else if (file.type.startsWith('video/')) {
      type = 'video'
      preview = URL.createObjectURL(file)
    } else if (file.type === 'text/plain') {
      type = 'text'
      const text = await file.text()
      preview = text.substring(0, 500) + (text.length > 500 ? '...' : '')
    }

    const newMemory: Memory = {
      id: Date.now().toString(),
      file,
      type,
      preview,
      uploadTime: new Date(),
    }

    setMemories([newMemory, ...memories])
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* 导航栏 */}
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
          {/* 左侧图片 */}
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img 
              src="/Hall.png" 
              alt="Digital Memorial Hall" 
              className="w-full rounded-lg shadow-md"
            />
          </div>
          {/* 右侧内容 */}
          <div className="md:w-1/2">
            <Header />
          </div>
        </div>

        <main className="max-w-4xl mx-auto">
          <UploadArea onFileUpload={handleFileUpload} />
          <Timeline memories={memories} />
        </main>
      </div>
    </div>
  )
}

export default App
