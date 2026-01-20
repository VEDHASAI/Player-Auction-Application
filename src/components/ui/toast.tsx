'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    description?: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, options?: { description?: string, type?: ToastType, duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, options?: { description?: string, type?: ToastType, duration?: number }) => {
        const id = Math.random().toString(36).substr(2, 9);
        const { description, type = 'info', duration = 5000 } = options || {};

        setToasts(prev => [...prev, { id, message, description, type }]);

        if (duration !== Infinity) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-20 right-4 z-100 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                flex items-start gap-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl 
                                ${t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
                                ${t.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' : ''}
                                ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : ''}
                                ${t.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : ''}
                            `}>
                                <div className="mt-0.5">
                                    {t.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                    {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                                    {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                    {t.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="text-sm font-black uppercase tracking-wider">{t.message}</div>
                                    {t.description && (
                                        <div className="text-xs opacity-70 leading-relaxed whitespace-pre-wrap">{t.description}</div>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="opacity-50 hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}
