/**
 * Visual Feedback Component
 * Provides visual feedback effects including particles, notifications, and animations
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info, Zap, Sparkles, Target } from 'lucide-react';

// Types
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'circle' | 'star' | 'spark';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface FeedbackState {
  particles: Particle[];
  notifications: Notification[];
  showParticles: boolean;
}

// Particle Effect Component
export const ParticleEffect: React.FC<{
  isActive: boolean;
  origin: { x: number; y: number };
  type?: 'success' | 'drop' | 'error' | 'magic';
  count?: number;
  className?: string;
}> = ({ isActive, origin, type = 'drop', count = 20, className = '' }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticle = useCallback((index: number): Particle => {
    const colors = {
      success: ['#10b981', '#34d399', '#6ee7b7'],
      drop: ['#3b82f6', '#60a5fa', '#93c5fd'],
      error: ['#ef4444', '#f87171', '#fca5a5'],
      magic: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#fbbf24', '#fcd34d']
    };

    const particleColors = colors[type];
    const angle = (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 2 + Math.random() * 3;
    const life = 60 + Math.random() * 40;

    return {
      id: `particle-${Date.now()}-${index}`,
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2,
      life,
      maxLife: life,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      size: 2 + Math.random() * 4,
      type: Math.random() > 0.7 ? 'star' : Math.random() > 0.3 ? 'circle' : 'spark'
    };
  }, [origin, type, count]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create initial particles
    const newParticles = Array.from({ length: count }, (_, i) => createParticle(i));
    setParticles(newParticles);

    // Animation loop
    const animate = () => {
      setParticles(prev => {
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          life: particle.life - 1,
          size: particle.size * 0.99 // shrink over time
        })).filter(particle => particle.life > 0);

        return updated;
      });
    };

    const interval = setInterval(animate, 16); // ~60fps
    const timeout = setTimeout(() => {
      setParticles([]);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, createParticle, count]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {particles.map(particle => {
        const opacity = particle.life / particle.maxLife;
        
        return (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: particle.x,
              top: particle.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {particle.type === 'star' ? (
              <Sparkles
                size={particle.size}
                style={{
                  color: particle.color,
                  opacity
                }}
              />
            ) : particle.type === 'spark' ? (
              <Zap
                size={particle.size}
                style={{
                  color: particle.color,
                  opacity
                }}
              />
            ) : (
              <div
                className="rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  opacity
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Success Animation Component
export const SuccessAnimation: React.FC<{
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
}> = ({ isVisible, onComplete, message = 'Success!' }) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-green-500 text-white p-6 rounded-full shadow-xl"
          >
            <Check size={48} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute mt-24 bg-white text-green-700 px-4 py-2 rounded-lg shadow-lg font-medium"
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Drop Zone Highlight Component
export const DropZoneHighlight: React.FC<{
  isActive: boolean;
  isValid: boolean;
  className?: string;
}> = ({ isActive, isValid, className = '' }) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 rounded-lg border-2 ${
        isValid
          ? 'border-green-400 bg-green-50'
          : 'border-red-400 bg-red-50'
      } ${className}`}
    >
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-lg ${
          isValid ? 'bg-green-200' : 'bg-red-200'
        }`}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className={`p-2 rounded-full ${
            isValid ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <Target size={24} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Notification System Component
export const NotificationSystem: React.FC<{
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}> = ({ notifications, onDismiss, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <Check size={20} />;
      case 'error': return <X size={20} />;
      case 'warning': return <AlertCircle size={20} />;
      case 'info': return <Info size={20} />;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2`}>
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
            className={`max-w-sm p-4 rounded-lg shadow-lg ${getColors(notification.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                )}
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="text-sm underline mt-2 hover:no-underline"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Pulse Effect Component
export const PulseEffect: React.FC<{
  isActive: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ isActive, color = '#3b82f6', size = 'md', className = '' }) => {
  if (!isActive) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`absolute ${className}`}>
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`${sizeClasses[size]} rounded-full`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

// Loading Shimmer Component
export const LoadingShimmer: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
        }}
      />
    </div>
  );
};

// Visual Feedback Provider Context
const VisualFeedbackContext = createContext(null);

export const VisualFeedbackProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const feedback = useVisualFeedback();
  
  return (
    <VisualFeedbackContext.Provider value={feedback}>
      {children}
    </VisualFeedbackContext.Provider>
  );
};

// Main Visual Feedback Hook
export const useVisualFeedback = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    particles: [],
    notifications: [],
    showParticles: false
  });

  const showParticles = useCallback((origin: { x: number; y: number }, type: 'success' | 'drop' | 'error' | 'magic' = 'drop') => {
    setFeedbackState(prev => ({
      ...prev,
      showParticles: true
    }));

    // Auto-hide after animation
    setTimeout(() => {
      setFeedbackState(prev => ({
        ...prev,
        showParticles: false
      }));
    }, 100);
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`
    };

    setFeedbackState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));

    // Auto-dismiss after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, notification.duration || 5000);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setFeedbackState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification({
      type: 'success',
      title: 'Success',
      message,
      duration: 3000
    });
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification({
      type: 'error',
      title: 'Error',
      message,
      duration: 5000
    });
  }, [showNotification]);

  return {
    feedbackState,
    showParticles,
    showNotification,
    dismissNotification,
    showSuccess,
    showError
  };
};

export default {
  ParticleEffect,
  SuccessAnimation,
  DropZoneHighlight,
  NotificationSystem,
  PulseEffect,
  LoadingShimmer,
  useVisualFeedback,
  VisualFeedbackProvider
};
