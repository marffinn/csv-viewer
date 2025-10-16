import { useRef } from 'react';
import { Upload, Download, Search, Replace } from 'lucide-react';

function Navbar({ csvData, headers, separator, onSeparatorChange, searchTerm, onSearchTermChange, onFileUpload, fileName, onFindAndReplaceClick }) {
    const fileInputRef = useRef(null);

    const handleDownload = () => {
        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(separator))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                {fileName && <span className="file-name-pill">{fileName}</span>}
            </div>
            <div className="nav-controls">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                />
                <div className="control-group">
                    <label>Open File</label>
                    <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={16} />
                        Open
                    </button>
                </div>

                {csvData.length > 0 && (
                    <div className="control-group">
                        <label>Save File</label>
                        <button className="btn btn-secondary" onClick={handleDownload}>
                            <Download size={16} />
                            Save
                        </button>
                    </div>
                )}

                <div className="control-group">
                    <label>Field Separator</label>
                    <select className="form-select" value={separator} onChange={(e) => onSeparatorChange(e.target.value)}>
                        <option value=";">Semicolon (;)</option>
                        <option value=",">Comma (,)</option>
                        <option value="\t">Tab</option>
                    </select>
                </div>

                {csvData.length > 0 && (
                    <div className="control-group">
                        <label>Find and Replace</label>
                        <button className="btn btn-secondary" onClick={onFindAndReplaceClick}>
                            <Replace size={16} />
                            Find and Replace
                        </button>
                    </div>
                )}

                {csvData.length > 0 && (
                    <div className="control-group">
                        <label>Search Data</label>
                        <div className="search-input">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => onSearchTermChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;