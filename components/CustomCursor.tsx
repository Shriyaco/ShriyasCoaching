
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// --- Desktop Cursor Implementation ---
const DesktopCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
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

    // Hide default cursor only on desktop
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
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#C5A059] rounded-full z-[10000]"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-[#C5A059] rounded-full z-[9999]"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 2 : 1,
          opacity: isHovering ? 0.8 : 0.4,
          backgroundColor: isHovering ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(197, 160, 89, 0)' : '#C5A059',
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.2 }}
      >
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

// --- Mobile Touch Effect Implementation (Optimized) ---
const MobileTouchEffect = () => {
  // Use MotionValues for direct DOM manipulation to bypass React render cycle lag
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Use opacity to show/hide instead of unmounting to keep performance high
  const opacity = useMotionValue(0); 
  const scale = useMotionValue(0.5);

  // Tighter spring for mobile to feel responsive but smooth
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothScale = useSpring(scale, { damping: 20, stiffness: 200 });
  const smoothOpacity = useSpring(opacity, { duration: 0.2 });

  useEffect(() => {
    const updateTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        x.set(touch.clientX);
        y.set(touch.clientY);
        opacity.set(1);
        scale.set(1);
      } else {
        opacity.set(0);
        scale.set(0.5);
      }
    };

    const handleEnd = () => {
        opacity.set(0);
        scale.set(0.5);
    };

    // Passive listeners for scrolling performance
    window.addEventListener('touchstart', updateTouch, { passive: true });
    window.addEventListener('touchmove', updateTouch, { passive: true });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
        window.removeEventListener('touchstart', updateTouch);
        window.removeEventListener('touchmove', updateTouch);
        window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('touchcancel', handleEnd);
    }
  }, [x, y, opacity, scale]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        <motion.div
            className="fixed top-0 left-0 w-6 h-6 rounded-full border border-[#C5A059] bg-[#C5A059]/10 shadow-[0_0_10px_rgba(197,160,89,0.3)] backdrop-blur-[1px]"
            style={{
                x: smoothX,
                y: smoothY,
                translateX: '-50%',
                translateY: '-50%',
                opacity: smoothOpacity,
                scale: smoothScale
            }}
        >
            <div className="w-full h-full rounded-full bg-[#C5A059] opacity-30 blur-sm animate-pulse" />
        </motion.div>
    </div>
  );
};

// --- Main Component ---
const CustomCursor: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const location = useLocation();
  
  const isDashboard = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/student') || 
                      location.pathname.startsWith('/teacher') ||
                      location.pathname.startsWith('/pratikmanage');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isDashboard) return null;
  if (isMobile === null) return null; // Avoid hydration mismatch or flash

  return isMobile ? <MobileTouchEffect /> : <DesktopCursor />;
};

export default CustomCursor;
