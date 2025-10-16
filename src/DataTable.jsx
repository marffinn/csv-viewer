import React, { useState, useEffect, useRef, useCallback } from 'react';

const isImageUrl = (text) => {
    if (!text) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(text) || text.includes('image');
};

const DataTable = React.memo(({ headers, data, setCsvData, onCellRightClick, onImagePreviewChange }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
    const tableRef = useRef(null);

    const handleCellEdit = useCallback((rowIndex, colIndex) => {
        setEditingCell({ row: rowIndex, col: colIndex });
        setEditValue(data[rowIndex][colIndex] || '');
    }, [data]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (editingCell) return;
            if (selectedCell.row === -1 || selectedCell.col === -1) return;

            let newRow = selectedCell.row;
            let newCol = selectedCell.col;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    newRow = Math.max(0, selectedCell.row - 1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    newRow = Math.min(data.length - 1, selectedCell.row + 1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    newCol = Math.max(0, selectedCell.col - 1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    newCol = Math.min(headers.length - 1, selectedCell.col + 1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleCellEdit(selectedCell.row, selectedCell.col);
                    return;
                default:
                    return;
            }
            setSelectedCell({ row: newRow, col: newCol });
        };

        const tableElement = tableRef.current;
        tableElement.addEventListener('keydown', handleKeyDown);

        return () => {
            tableElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedCell, editingCell, data.length, headers.length, handleCellEdit]);

    const handleSaveEdit = () => {
        if (editingCell) {
            const newData = [...data];
            newData[editingCell.row][editingCell.col] = editValue;
            setCsvData(newData);
            setEditingCell(null);
            setEditValue('');
        }
    };

    const handleCellClick = (rowIndex, colIndex) => {
        setSelectedCell({ row: rowIndex, col: colIndex });
    };

    const handleMouseEnter = (e, content) => {
        if (isImageUrl(content)) {
            const x = e.clientX + 10;
            const y = e.clientY + 220 > window.innerHeight ? e.clientY - 210 : e.clientY + 10;
            onImagePreviewChange({ show: true, url: content, x, y });
        }
    };

    const handleMouseLeave = () => {
        onImagePreviewChange({ show: false, url: '', x: 0, y: 0 });
    };

    const formatCellContent = (content) => {
        if (isImageUrl(content)) {
            return (
                <a
                    href={content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image-link"
                    onMouseEnter={(e) => handleMouseEnter(e, content)}
                    onMouseLeave={handleMouseLeave}
                >
                    {content}
                </a>
            );
        }
        return content;
    };


    return (
        <div ref={tableRef} tabIndex={-1} className="table-container custom-scrollbar">
            <table className="csv-table">
                <thead>
                    <tr>
                        <th className="row-header"></th>
                        {headers.map((header, index) => (
                            <th key={index}>{header.toUpperCase()}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="row-header">{rowIndex + 1}</td>
                            {headers.map((_, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'selected' : ''}
                                    onContextMenu={(e) => onCellRightClick(e, rowIndex, colIndex)}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                    onDoubleClick={() => handleCellEdit(rowIndex, colIndex)}
                                >
                                    {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                                        <input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={handleSaveEdit}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit();
                                                if (e.key === 'Escape') setEditingCell(null);
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <div>{formatCellContent(row[colIndex])}</div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default DataTable;