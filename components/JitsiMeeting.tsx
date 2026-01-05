import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface JitsiMeetingProps {
  roomName: string;
  userName: string;
  onClose: () => void;
}

const JitsiMeeting: React.FC<JitsiMeetingProps> = ({ roomName, userName, onClose }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if the script is already present in the global scope
    // @ts-ignore
    if (window.JitsiMeetExternalAPI) {
      setApiLoaded(true);
      return;
    }

    // 2. If not loaded, inject the script dynamically
    // This ensures we only download the Jitsi library when a user actually joins a class
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setApiLoaded(true);
    script.onerror = () => setError('The classroom engine could not be initialized. Please check your internet connection.');
    document.body.appendChild(script);

    return () => {
      // Cleanup logic if needed, but usually we keep the script cached once loaded
    };
  }, []);

  useEffect(() => {
    // 3. Initialize the meeting once the script is ready and the container exists
    // @ts-ignore
    if (apiLoaded && window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName
        },
        configOverwrite: {
            startWithAudioMuted: true,
            disableModeratorIndicator: false,
            startScreenSharing: true,
            enableEmailInStats: false,
            prejoinPageEnabled: false, // Skips the extra "join" screen for a faster experience
            enableWelcomePage: false,
            chromeExtensionBanner: null // Removes annoying banners
        },
        interfaceConfigOverwrite: {
            DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                'security'
            ],
        }
      };

      // @ts-ignore
      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener('readyToClose', () => {
        onClose();
      });

      return () => {
        api.dispose();
      };
    }
  }, [apiLoaded, roomName, userName, onClose]);

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-fade-in">
        {/* Modern Classroom Header */}
        <div className="h-14 bg-premium-black border-b border-white/5 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                <h3 className="text-premium-accent font-black uppercase text-[9px] tracking-[0.4em]">Shriya's Virtual Gurukul</h3>
            </div>
            <button 
                onClick={onClose} 
                className="text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 group"
            >
                <X size={14} className="group-hover:rotate-90 transition-transform" /> Exit Session
            </button>
        </div>
        
        <div className="flex-1 w-full h-full relative bg-[#050505]">
            {/* Loading Placeholder */}
            {!apiLoaded && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-premium-accent mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Syncing with secure server...</p>
                </div>
            )}
            
            {/* Error Handling UI */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 mb-6 border border-rose-500/20">
                        <AlertCircle size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Classroom Connection Failed</h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold max-w-xs mb-8">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-premium-accent transition-all active:scale-95 shadow-xl"
                    >
                        Try Reconnecting
                    </button>
                </div>
            )}
            
            {/* The Jitsi Iframe Mount Point */}
            <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
    </div>
  );
};

export default JitsiMeeting;