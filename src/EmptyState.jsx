import React from 'react';
import { Upload } from 'lucide-react';

const EmptyState = () => {
    return (
        <div className="empty">
            <Upload size={48} />
            <h2>No CSV file loaded</h2>
            <p>Click "Open" or drag & drop a file to get started</p>
        </div>
    );
};

export default EmptyState;