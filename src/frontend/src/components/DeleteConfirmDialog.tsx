import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
    /** Name of the document to be deleted, shown in the dialog body. */
    documentName: string;
    /** Called when the user confirms deletion. */
    onConfirm: () => void;
    /** Called when the user cancels or closes the dialog. */
    onCancel: () => void;
    /** Disables buttons while the delete request is in-flight. */
    isDeleting?: boolean;
}

/**
 * Modal confirmation dialog shown before permanently deleting a document.
 * Clicking the backdrop or the ✕ button cancels the action.
 */
export const DeleteConfirmDialog = ({
    documentName,
    onConfirm,
    onCancel,
    isDeleting = false,
}: DeleteConfirmDialogProps) => {
    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
        >
            {/* Panel — stop clicks from bubbling to backdrop */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    aria-label="Cancel"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 mx-auto mb-4">
                    <AlertTriangle size={28} className="text-rose-500" strokeWidth={2} />
                </div>

                {/* Title */}
                <h2
                    id="delete-dialog-title"
                    className="text-lg font-bold text-gray-900 text-center mb-2"
                >
                    Delete Document?
                </h2>

                {/* Body */}
                <p className="text-sm text-gray-500 text-center mb-6">
                    You are about to permanently delete{' '}
                    <span className="font-semibold text-gray-700 break-all">"{documentName}"</span>.
                    This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 transition-colors disabled:opacity-60"
                    >
                        {isDeleting ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
