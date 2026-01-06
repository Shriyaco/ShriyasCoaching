
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Immediate cursor position (for the inner dot)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring physics for the outer ring (creates the smooth trailing effect)
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable custom cursor on touch devices to ensure native touch behavior works best
    if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // Detect interactive elements
        const isInteractive = 
            target.tagName === 'A' || 
            target.tagName === 'BUTTON' || 
            target.closest('a') || 
            target.closest('button') ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.getAttribute('role') === 'button' ||
            window.getComputedStyle(target).cursor === 'pointer';
        
        setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Global style to hide the default cursor
    const style = document.createElement('style');
    style.id = 'custom-cursor-global-style';
    style.innerHTML = `
      * { cursor: none !important; }
      body { cursor: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      const existingStyle = document.getElementById('custom-cursor-global-style');
      if(existingStyle) existingStyle.remove();
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Inner Dot - Precise pointer */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#C5A059] rounded-full z-[10000]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Outer Ring - Follower with lag */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#C5A059] rounded-full z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 2 : 1,
          opacity: isHovering ? 0.8 : 0.4,
          backgroundColor: isHovering ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(197, 160, 89, 0)' : '#C5A059',
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.2 }}
      >
          {/* Subtle glow effect when hovering */}
          {isHovering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full rounded-full bg-[#C5A059] blur-md opacity-20"
              />
          )}
      </motion.div>
    </div>
  );
};

export default CustomCursor;
