import React from 'react';
import { motion } from 'framer-motion';
import { useConfig } from '@/hooks/use-config';

const NewsTicker: React.FC = () => {
  const { config, loading } = useConfig();

  if (loading || !config) return null;

  const messages = config.news || [];

  return (
    <div className="fixed bottom-0 left-0 w-full h-10 bg-slate-950 border-t border-slate-800 z-50 flex items-center overflow-hidden">
      {/* Label "EN DIRECT" */}
      <div className="flex-shrink-0 bg-red-600 h-full px-4 flex items-center justify-center z-10 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
        <span className="text-white font-bold text-xs uppercase tracking-wider animate-pulse whitespace-nowrap">
          EN DIRECT
        </span>
      </div>

      {/* Scrolling Area */}
      <div className="relative flex-grow h-full flex items-center overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap gap-16 pl-8"
          animate={{ x: [0, -2000] }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {/* Double content for seamless looping */}
          <div className="flex gap-16 items-center">
            {messages.map((msg: string, index: number) => (
              <span key={`msg-1-${index}`} className="text-slate-200 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                {msg}
              </span>
            ))}
          </div>
          <div className="flex gap-16 items-center">
            {messages.map((msg: string, index: number) => (
              <span key={`msg-2-${index}`} className="text-slate-200 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                {msg}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsTicker;
