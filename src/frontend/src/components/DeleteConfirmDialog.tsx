import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
    filename: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
}

/**
 * Modal confirmation dialog for document deletion.
 * Displays the filename and requires explicit user confirmation.
 */
export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    filename,
    onConfirm,
    onCancel,
    isDeleting = false,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Handle keyboard events for accessibility
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);
        
        // Focus the dialog when it opens
        if (dialogRef.current) {
            dialogRef.current.focus();
        }

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel]);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
        >
            {/* Dialog panel */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-dialog-title"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1} // Make the dialog focusable
            >
                {/* Icon + Heading */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <AlertTriangle size={22} className="text-red-500" />
                    </div>
                    <h2
                        id="delete-dialog-title"
                        className="text-lg font-semibold text-gray-900"
                    >
                        Delete Document
                    </h2>
                </div>

                {/* Body */}
                <p className="text-sm text-gray-600 leading-relaxed">
                    Are you sure you want to permanently delete{' '}
                    <span className="font-semibold text-gray-900">"{filename}"</span>?
                    This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-1">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Cancel deletion"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                        aria-label={`Delete ${filename}`}
                    >
                        {isDeleting ? (
                            <>
                                <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
