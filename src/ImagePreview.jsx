import React from 'react';

const ImagePreview = ({ show, url, x, y }) => {
    if (!show) {
        return null;
    }

    return (
        <div
            className="image-preview"
            style={{
                transform: `translate(${x}px, ${y}px)`,
            }}
        >
            <img src={url} alt="Preview" />
        </div>
    );
};

export default ImagePreview;