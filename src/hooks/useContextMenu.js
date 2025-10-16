import { useState, useCallback } from 'react';

function useContextMenu() {
    const [contextMenu, setContextMenu] = useState({
        show: false,
        x: 0,
        y: 0,
        rowIndex: -1,
        colIndex: -1,
    });

    const handleCellRightClick = useCallback((e, rowIndex, colIndex) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            rowIndex,
            colIndex,
        });
    }, []);

    const hideContextMenu = useCallback(() => {
        if (contextMenu.show) {
            setContextMenu((prev) => ({ ...prev, show: false }));
        }
    }, [contextMenu.show]);

    return { contextMenu, handleCellRightClick, hideContextMenu };
}

export default useContextMenu;