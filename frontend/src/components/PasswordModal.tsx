import React, { useState } from 'react';
import { FaLock, FaTimes } from 'react-icons/fa';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  action: 'create' | 'edit' | 'delete';
  isLoading?: boolean;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  action,
  isLoading = false
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(password);
      setPassword('');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid password';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaLock className="text-amber-600 text-lg" />
            <h2 className="text-lg font-semibold text-gray-900">Enter Edit Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={submitting || isLoading}
          >
            <FaTimes />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Enter today's rotating password to {action} this entry.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-lg text-center tracking-widest"
            disabled={submitting || isLoading}
            autoFocus
          />

          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              disabled={submitting || isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              disabled={submitting || isLoading || !password}
            >
              {submitting || isLoading ? 'Verifying...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
