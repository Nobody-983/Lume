import { useId, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { IMAGE_ACCEPT, formatBytes } from '../services/images.js';
import { Button } from './Button.jsx';
import { ImageWithFallback } from './ImageWithFallback.jsx';
import { Spinner } from './Spinner.jsx';

export function UploadZone({
  preview,
  file,
  meta,
  error,
  checking = false,
  onSelect,
  onRemove,
  title = 'Add a portrait',
  hint = 'Drag and drop, or choose a file',
  requirements = [],
  aspect = 'portrait',
  disabled = false,
  inputLabel = 'Choose an image',
  className = '',
}) {
  const inputRef = useRef(null);
  const inputId = useId();
  const hintId = useId();
  const [dragging, setDragging] = useState(false);
  const busy = disabled || checking;

  function openPicker() {
    if (!busy) inputRef.current?.click();
  }

  function handleFiles(fileList) {
    const nextFile = fileList?.[0];
    if (nextFile) onSelect(nextFile);
  }

  function handleChange(event) {
    handleFiles(event.target.files);
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className={`upload-zone upload-zone--${aspect} ${className}`.trim()}>
      <input
        ref={inputRef}
        id={inputId}
        className="sr-only"
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={handleChange}
        aria-label={inputLabel}
        disabled={busy}
      />

      {preview ? (
        <div className="upload-preview">
          <div className="upload-preview__image">
            <ImageWithFallback src={preview} alt="Selected upload preview" loading="eager" />
            <span className="upload-preview__badge">
              <ImagePlus size={14} strokeWidth={1.7} aria-hidden="true" />
              Ready
            </span>
          </div>
          <div className="upload-preview__meta">
            <div>
              <p className="upload-preview__name">{file?.name || 'Selected image'}</p>
              <p className="meta-copy">
                {meta ? `${meta.width} × ${meta.height}` : ''}
                {meta && file ? ' · ' : ''}
                {file ? formatBytes(file.size) : ''}
              </p>
            </div>
            <div className="upload-preview__actions">
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={openPicker}
                disabled={busy}
              >
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={onRemove}
                disabled={busy}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`upload-drop ${dragging ? 'is-dragging' : ''}`.trim()}
          onClick={openPicker}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
          disabled={busy}
          aria-describedby={hintId}
        >
          <span className="upload-drop__icon" aria-hidden="true">
            {checking ? <Spinner size={22} /> : <UploadCloud size={26} strokeWidth={1.35} />}
          </span>
          <span className="upload-drop__title">{checking ? 'Checking image…' : title}</span>
          <span className="upload-drop__hint" id={hintId}>
            {dragging ? 'Drop to add this image' : hint}
          </span>
          <span className="upload-drop__formats">JPG or PNG · up to 10 MB</span>
        </button>
      )}

      {requirements.length ? (
        <ul className="upload-requirements">
          {requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
