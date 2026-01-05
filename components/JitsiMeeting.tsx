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
    // @ts-ignore
    if (window.JitsiMeetExternalAPI) {
      setApiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setApiLoaded(true);
    script.onerror = () => setError('Communication engine failure.');
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
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
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            pwa: { enabled: false },
        },
        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'raisehand', 'videoquality', 'filmstrip', 'tileview', 'mute-everyone',
                'security'
            ],
            MOBILE_APP_PROMO: false,
        }
      };

      // @ts-ignore
      const api = new window.JitsiMeetExternalAPI(domain, options);
      api.addEventListener('readyToClose', onClose);
      return () => api.dispose();
    }
  }, [apiLoaded, roomName, userName, onClose]);

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col">
        <div className="h-16 bg-black border-b border-white/5 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                <h3 className="text-white/40 font-black uppercase text-[9px] tracking-[0.5em]">Secure Terminal • {userName}</h3>
            </div>
            <button onClick={onClose} className="text-white/20 hover:text-white font-black text-[9px] uppercase tracking-[0.4em] transition-all flex items-center gap-2 group">
                <X size={14} className="group-hover:rotate-90 transition-transform" /> Exit Hub
            </button>
        </div>
        
        <div className="flex-1 w-full h-full relative bg-black">
            {!apiLoaded && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-white/20 mb-4" size={24} />
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">Establishing stream protocol...</p>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <AlertCircle className="text-rose-500/40 mb-4" size={32} />
                    <p className="text-white/20 text-[9px] uppercase tracking-[0.5em] font-black">{error}</p>
                </div>
            )}
            <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
    </div>
  );
};

export default JitsiMeeting;