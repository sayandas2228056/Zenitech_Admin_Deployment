import React, { useState } from 'react';

const ScreenshotUpload = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file && !note.trim()) {
      alert('Please provide a screenshot or a note.');
      return;
    }

    setSubmitting(true);
    // Demo placeholder: simulate async submission
    setTimeout(() => {
      setSubmitting(false);
      onClose?.();
      alert('Thanks! Your report was recorded (demo).');
    }, 800);
  };

  return (
    <div className="p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
            Screenshot
          </label>
          <input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
          />
          {file && <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>}
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe the issue briefly..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={`px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
              submitting
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScreenshotUpload;
