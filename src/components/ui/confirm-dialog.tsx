'use client';

import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'warning',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
        info: "bg-blue-600 hover:bg-blue-700 text-white"
    };

    const icons = {
        danger: <AlertTriangle className="w-6 h-6 text-red-500" />,
        warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
        info: <Info className="w-6 h-6 text-blue-500" />
    };

    const iconBg = {
        danger: "bg-red-500/10",
        warning: "bg-yellow-500/10",
        info: "bg-blue-500/10"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#111827] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${iconBg[variant]}`}>
                            {icons[variant]}
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>

                    <p className="text-slate-400">
                        {description}
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onCancel} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            {cancelText}
                        </Button>
                        <Button
                            className={variantStyles[variant]}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
