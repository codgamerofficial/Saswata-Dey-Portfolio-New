
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { X, Mic, MicOff, Volume2, User, Bot, Loader2, Key, AlertCircle, Zap } from 'lucide-react';
import { RESUME_DATA } from '../constants';

// Extending window for AI Studio helpers
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Using optional property to match potential existing global declarations and avoid "identical modifiers" error.
    aistudio?: AIStudio;
  }
}

interface LiveAIAgentProps {
  onClose: () => void;
}

export const LiveAIAgent: React.FC<LiveAIAgentProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Refs for buffering transcriptions to provide smoother UI (following streaming best practices)
  const currentInputTranscription = useRef<string>('');
  const currentOutputTranscription = useRef<string>('');

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    try {
      // FIX: Use optional chaining for aistudio
      const selected = await window.aistudio?.hasSelectedApiKey();
      setHasKey(!!selected);
    } catch (e) {
      setHasKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      // FIX: Use optional chaining for aistudio
      await window.aistudio?.openSelectKey();
      // Assume success after triggering the dialog to avoid race conditions as per instructions
      setHasKey(true);
      setErrorMessage(null);
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  // Manual implementation of base64 decoding (standard raw PCM decoding)
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Manual implementation of base64 encoding (standard raw PCM encoding)
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Decodes raw PCM data from the model turn
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  // Prepares audio chunk for sending to the model
  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setErrorMessage(null);
    try {
      setIsConnecting(true);
      
      // FIX: Create a new GoogleGenAI instance right before making the API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are Jervice, a highly advanced Multiverse Concierge for the portfolio of Saswata Dey.
            Your tone is professional, helpful, and cinematic (inspired by JARVIS and other multiversal AI).
            
            Saswata's background:
            - Experience: GIS Data Processor at Digital Indian Business Solution, Sales & Marketing at HighRadius.
            - Skills: Manual & Automation Testing, Core Java, SQL, GIS (ArcGIS), Photogrammetry.
            - Projects: Automatic License Plate Recognition, Pothole Detection.
            - Themes: His portfolio is themed around heroes like Superman, Ben 10, Avengers, Harry Potter, and Stranger Things.
            
            When answering:
            - Acknowledge his "heroic" technical feats in QA and GIS.
            - Use occasional references to his multiverse themes (e.g., "Scanning his technical archives in the Avengers zone...").
            - Be concise. Represent Saswata as a top-tier engineer.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // FIX: Solely rely on sessionPromise resolves to send realtime input
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // FIX: Buffer transcriptions for smoother turn-based display
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userText = currentInputTranscription.current;
              const assistantText = currentOutputTranscription.current;
              
              if (userText) {
                setTranscription(prev => [...prev, { role: 'user', text: userText }]);
                currentInputTranscription.current = '';
              }
              if (assistantText) {
                setTranscription(prev => [...prev, { role: 'assistant', text: assistantText }]);
                currentOutputTranscription.current = '';
              }
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const ctx = outputContextRef.current;
              // Schedule each chunk to ensure smooth playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Gemini Live Error:', e);
            // FIX: Handle "Requested entity was not found" by resetting key selection
            if (e?.message?.includes("Requested entity was not found")) {
              setHasKey(false);
            }
            setErrorMessage(e?.message || "Connection failed.");
            setIsConnecting(false);
            setIsActive(false);
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (error: any) {
      setErrorMessage(error?.message || "Network Error.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/20 to-transparent">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isActive ? 'bg-green-500 animate-pulse' : 'bg-blue-600'}`}>
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl uppercase tracking-widest">Jervice Concierge</h3>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-tighter">{isActive ? 'Systems Online' : 'Standby Mode'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 text-red-400">
              <AlertCircle size={24} />
              <p className="text-sm font-bold">{errorMessage}</p>
            </div>
          )}

          {!hasKey && (
            <div className="text-center py-12">
              <Key size={48} className="mx-auto mb-6 text-yellow-500" />
              <h4 className="text-2xl font-black mb-4 uppercase">Authorize Access</h4>
              <p className="text-gray-500 mb-4 max-w-sm mx-auto font-medium">Please provide a valid Multiverse Protocol Key (Gemini API Key) from a paid GCP project to initialize Jervice.</p>
              {/* FIX: Add link to billing documentation as required */}
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-500 text-xs block mb-8 hover:underline">Billing & API Key Documentation</a>
              <button onClick={handleSelectKey} className="px-10 py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">Select Key</button>
            </div>
          )}

          {hasKey && transcription.length === 0 && !isActive && !isConnecting && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                <Volume2 size={48} />
              </div>
              <p className="text-gray-400 text-lg mb-8 font-bold italic">"Ready to assist, Captain Saswata."</p>
              <button onClick={startSession} className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/50 hover:scale-110 transition-all">Summon Jervice</button>
            </div>
          )}

          {isConnecting && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="text-blue-400 font-black tracking-widest uppercase text-xs">Calibrating Multiverse Frequencies...</p>
            </div>
          )}

          {transcription.map((msg, i) => (
            <div key={i} className={`flex gap-4 animate-in slide-in-from-bottom-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <Bot size={20} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-white text-black rounded-tr-none shadow-xl' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
              }`}>
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center shrink-0">
                  <User size={20} className="text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        {isActive && (
          <div className="p-8 bg-slate-950/50 border-t border-white/5 flex items-center justify-between gap-8">
            <div className="flex gap-2 items-center flex-1">
               {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                 <div key={i} className="w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 32 + 8}px`, animationDelay: `${i * 0.1}s` }}></div>
               ))}
            </div>
            <button onClick={stopSession} className="p-6 bg-red-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
              <MicOff size={32} />
            </button>
            <div className="flex-1 text-right">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
