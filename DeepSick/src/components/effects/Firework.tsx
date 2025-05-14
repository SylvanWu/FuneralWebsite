import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define firework colors
const FIREWORK_COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
  '#ff00ff', '#00ffff', '#ff8800', '#ff0088'
];

// Number of particles in the explosion
const PARTICLES_COUNT = 30;

// Generate particles array
const PARTICLES = Array.from({ length: PARTICLES_COUNT });

// Firework sound URLs
const FIREWORK_SOUNDS = [
  'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAAFgAAAzIxOTk5NjJfcG9wX2ZpejJfMDIAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAAFgAAAzIxOTk5NjJfcG9wX2ZpejJfMDMAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
];

// Rocket animation variants
const rocketVariants = {
  initial: { y: 0, opacity: 1 },
  animate: { 
    y: -100, 
    opacity: [1, 0.8, 0], 
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    }
  }
};

// Animation variants for the firework particles
const particleVariants = {
  hidden: { scale: 0, opacity: 1 },
  visible: (i: number) => {
    // Create a starburst pattern with some randomness
    const angle = (i / PARTICLES_COUNT) * 2 * Math.PI;
    const distance = 100 + Math.random() * 50;
    return {
      scale: [0, 1.5, 1, 0],
      opacity: [0, 1, 0.8, 0],
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle),
      transition: { 
        duration: 0.8 + Math.random() * 0.6,  
        ease: 'easeOut'
      }
    };
  }
};

interface FireworkProps {
  x: number;
  y: number;
  show: boolean;
}

/**
 * Firework component that creates a realistic firework animation
 * at the specified coordinates when the show prop is true.
 */
const Firework: React.FC<FireworkProps> = ({ x, y, show }) => {
  const [showParticles, setShowParticles] = useState(false);
  const [particleColor, setParticleColor] = useState('');
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  // Reset state when show changes
  useEffect(() => {
    if (show) {
      setShowParticles(false);
      // Choose a random color for this firework
      setParticleColor(FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]);
      
      // Play rocket launch sound (optional, uncomment if you want)
      // if (audioRef.current) {
      //   audioRef.current.currentTime = 0;
      //   audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      // }
      
      // After rocket animation, show particles and play explosion sound
      setTimeout(() => {
        setShowParticles(true);
        
        // Play explosion sound
        if (audioRef.current) {
          // Pick random firework sound
          audioRef.current.src = FIREWORK_SOUNDS[Math.floor(Math.random() * FIREWORK_SOUNDS.length)];
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      }, 490); // Slightly before rocket animation ends
    }
  }, [show]);
  
  return (
    <AnimatePresence>
      {show && (
        <div
          style={{
            position: 'fixed',
            left: x,
            top: y,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {/* Audio element for firework sounds */}
          <audio ref={audioRef} preload="auto" />
          
          {/* Rocket trail */}
          {!showParticles && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={rocketVariants}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 4,
                height: 10,
                background: 'white',
                boxShadow: '0 0 6px 1px rgba(255, 255, 255, 0.8)',
                borderRadius: '50% 50% 0 0',
                transformOrigin: 'center bottom'
              }}
            />
          )}
          
          {/* Explosion particles */}
          <AnimatePresence>
            {showParticles && PARTICLES.map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={particleVariants}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: -100, // Start explosion where rocket ends
                  width: 4 + Math.random() * 3,
                  height: 4 + Math.random() * 3,
                  background: particleColor,
                  boxShadow: `0 0 6px 2px ${particleColor}`,
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Firework; 