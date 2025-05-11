import React from 'react';

// Interface for component props
interface DeceasedImageProps {
  imageUrl?: string;
  name: string;
}

/**
 * Component to display the deceased person's image
 * If no image is provided, displays a placeholder with the person's name
 */
const DeceasedImage: React.FC<DeceasedImageProps> = ({ imageUrl, name }) => {
  // Generate initials from name
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      {imageUrl ? (
        // Display actual image if provided
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        // Display placeholder with initials if no image
        <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg mb-3">
          <span className="text-4xl font-bold text-gray-600">
            {getInitials(name)}
          </span>
        </div>
      )}
      
      {/* Name of the deceased */}
      <h2 className="text-2xl font-bold text-center">
        {name}
      </h2>
      <p className="text-gray-600 text-center">
        In Loving Memory
      </p>
    </div>
  );
};

export default DeceasedImage; 