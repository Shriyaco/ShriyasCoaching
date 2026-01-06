
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

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

// --- Mobile Touch Effect Implementation ---
const MobileTouchEffect = () => {
  const [touches, setTouches] = useState<{id: number, x: number, y: number}[]>([]);

  useEffect(() => {
    const updateTouches = (e: TouchEvent) => {
      const newTouches = Array.from(e.touches).map(t => ({
        id: t.identifier,
        x: t.clientX,
        y: t.clientY
      }));
      setTouches(newTouches);
    };

    // Use passive listeners for better scrolling performance
    window.addEventListener('touchstart', updateTouches, { passive: true });
    window.addEventListener('touchmove', updateTouches, { passive: true });
    window.addEventListener('touchend', updateTouches);
    window.addEventListener('touchcancel', updateTouches);

    return () => {
        window.removeEventListener('touchstart', updateTouches);
        window.removeEventListener('touchmove', updateTouches);
        window.removeEventListener('touchend', updateTouches);
        window.removeEventListener('touchcancel', updateTouches);
    }
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        <AnimatePresence>
            {touches.map(touch => (
                <motion.div
                    key={touch.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute w-12 h-12 rounded-full border-2 border-[#C5A059] bg-[#C5A059]/10 shadow-[0_0_20px_rgba(197,160,89,0.4)] backdrop-blur-[1px]"
                    style={{
                        left: touch.x,
                        top: touch.y,
                        translateX: '-50%',
                        translateY: '-50%'
                    }}
                >
                    <motion.div 
                        className="w-full h-full rounded-full bg-[#C5A059] opacity-20 blur-md"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
  );
};

// --- Main Component ---
const CustomCursor: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile === null) return null; // Avoid hydration mismatch or flash

  return isMobile ? <MobileTouchEffect /> : <DesktopCursor />;
};

export default CustomCursor;
