import React, { useEffect, useRef } from 'react';

function FindAndReplaceModal({ show, onClose, onFindAndReplace }) {
    const findInputRef = useRef(null);
    const replaceInputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    const handleReplace = () => {
        const find = findInputRef.current.value;
        const replace = replaceInputRef.current.value;
        onFindAndReplace(find, replace, false);
    };

    const handleReplaceAll = () => {
        const find = findInputRef.current.value;
        const replace = replaceInputRef.current.value;
        onFindAndReplace(find, replace, true);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Find and Replace</h2>
                <div className="form-group">
                    <label htmlFor="find">Find</label>
                    <input type="text" id="find" name="find" required autoFocus ref={findInputRef} />
                </div>
                <div className="form-group">
                    <label htmlFor="replace">Replace with</label>
                    <input type="text" id="replace" name="replace" ref={replaceInputRef} />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn btn-primary" onClick={handleReplace}>Replace</button>
                    <button type="button" className="btn btn-primary" onClick={handleReplaceAll}>Replace All</button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default FindAndReplaceModal;
