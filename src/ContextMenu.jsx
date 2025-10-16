import React from 'react';

const ContextMenu = ({ show, x, y, rowIndex, colIndex, headers, csvData, setCsvData, setHeaders, hideContextMenu }) => {
    if (!show) {
        return null;
    }

    const addRowAbove = () => {
        const newRow = new Array(headers.length).fill('');
        const newData = [...csvData];
        newData.splice(rowIndex, 0, newRow);
        setCsvData(newData);
        hideContextMenu();
    };

    const addRowBelow = () => {
        const newRow = new Array(headers.length).fill('');
        const newData = [...csvData];
        newData.splice(rowIndex + 1, 0, newRow);
        setCsvData(newData);
        hideContextMenu();
    };

    const deleteRow = () => {
        const newData = csvData.filter((_, i) => i !== rowIndex);
        setCsvData(newData);
        hideContextMenu();
    };

    const addColumnBefore = () => {
        const newHeaders = [...headers];
        newHeaders.splice(colIndex, 0, 'New Column');
        setHeaders(newHeaders);
        const newData = csvData.map(row => {
            const newRow = [...row];
            newRow.splice(colIndex, 0, '');
            return newRow;
        });
        setCsvData(newData);
        hideContextMenu();
    };

    const addColumnAfter = () => {
        const newHeaders = [...headers];
        newHeaders.splice(colIndex + 1, 0, 'New Column');
        setHeaders(newHeaders);
        const newData = csvData.map(row => {
            const newRow = [...row];
            newRow.splice(colIndex + 1, 0, '');
            return newRow;
        });
        setCsvData(newData);
        hideContextMenu();
    };

    const deleteColumn = () => {
        const newHeaders = headers.filter((_, i) => i !== colIndex);
        setHeaders(newHeaders);
        const newData = csvData.map(row => row.filter((_, i) => i !== colIndex));
        setCsvData(newData);
        hideContextMenu();
    };

    return (
        <div
            className="context-menu"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="context-menu-item" onClick={addRowAbove}>Add Row Above</div>
            <div className="context-menu-item" onClick={addRowBelow}>Add Row Below</div>
            <div className="context-menu-item" onClick={deleteRow}>Delete Row</div>
            <div className="context-menu-divider"></div>
            <div className="context-menu-item" onClick={addColumnBefore}>Add Column Before</div>
            <div className="context-menu-item" onClick={addColumnAfter}>Add Column After</div>
            <div className="context-menu-item" onClick={deleteColumn}>Delete Column</div>
        </div>
    );
};

export default ContextMenu;