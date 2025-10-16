import { useState, useEffect, useCallback } from 'react';

function useDragAndDrop(loadFileCallback) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await loadFileCallback(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [loadFileCallback]);

    useEffect(() => {
        const appElement = document.getElementById('root'); // Or your main app div
        appElement.addEventListener('dragover', handleDragOver);
        appElement.addEventListener('dragleave', handleDragLeave);
        appElement.addEventListener('drop', handleDrop);

        return () => {
            appElement.removeEventListener('dragover', handleDragOver);
            appElement.removeEventListener('dragleave', handleDragLeave);
            appElement.removeEventListener('drop', handleDrop);
        };
    }, [handleDragOver, handleDragLeave, handleDrop]);

    return { isDragging };
}

export default useDragAndDrop;