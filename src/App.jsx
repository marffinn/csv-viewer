import { useState, useMemo, useCallback } from 'react';
import Papa from 'paparse';

// Components (from the './' directory)
import Navbar from './Navbar';
import DataTable from './DataTable';
import EmptyState from './EmptyState';
import ImagePreview from './ImagePreview';
import ContextMenu from './ContextMenu';
import FindAndReplaceModal from './FindAndReplaceModal';

// Hooks (from the './hooks/' directory)
import useDragAndDrop from './hooks/useDragAndDrop.js'; // Added .js for clarity
import useContextMenu from './hooks/useContextMenu.js';   // Added .js for clarity

// Styles
import './App.css';
import './FindAndReplaceModal.css';

function App() {
  // --- STATE MANAGEMENT ---
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [rawFileContent, setRawFileContent] = useState('');
  const [separator, setSeparator] = useState(';');
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState({ show: false, url: '', x: 0, y: 0 });
  const [showFindAndReplaceModal, setShowFindAndReplaceModal] = useState(false);

  // --- CUSTOM HOOKS ---
  const { contextMenu, handleCellRightClick, hideContextMenu } = useContextMenu();

  const detectSeparator = (content) => {
    const separators = [';', ',', '\t'];
    const firstLine = content.split('\n')[0];
    let bestSeparator = ';';
    let maxColumns = 0;

    separators.forEach(sep => {
      const columns = firstLine.split(sep).length;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestSeparator = sep;
      }
    });
    return bestSeparator;
  };

  const parseCSVContent = useCallback((content, delimiter) => {
    return new Promise((resolve) => {
      Papa.parse(content, {
        delimiter,
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            resolve({
              headers: results.data[0],
              data: results.data.slice(1)
            });
          } else {
            resolve({ headers: [], data: [] });
          }
        }
      });
    });
  }, []);

  const loadFile = useCallback(async (file) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setFileName(file.name);
      const content = await file.text();
      setRawFileContent(content);

      const detectedSeparator = detectSeparator(content);
      setSeparator(detectedSeparator);

      const parsed = await parseCSVContent(content, detectedSeparator);
      setHeaders(parsed.headers);
      setCsvData(parsed.data);
    }
  }, [parseCSVContent]);

  const handleSeparatorChange = useCallback(async (newSeparator) => {
    setSeparator(newSeparator);
    if (rawFileContent) {
      const parsed = await parseCSVContent(rawFileContent, newSeparator);
      setHeaders(parsed.headers);
      setCsvData(parsed.data);
    }
  }, [rawFileContent, parseCSVContent]);

  const handleFindAndReplace = (find, replace, replaceAll) => {
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\\]/g, '\\$&'); // $& means the whole matched string
    };

    const findRegex = new RegExp(escapeRegExp(find), replaceAll ? 'g' : '');
    let replaced = false;

    const newData = csvData.map(row => {
        if (replaceAll) {
            return row.map(cell => {
                if (typeof cell === 'string') {
                    return cell.replace(findRegex, replace);
                }
                return cell;
            });
        } else {
            if (replaced) {
                return row;
            }
            return row.map(cell => {
                if (typeof cell === 'string' && !replaced) {
                    const newCell = cell.replace(findRegex, replace);
                    if (newCell !== cell) {
                        replaced = true;
                    }
                    return newCell;
                }
                return cell;
            });
        }
    });

    setCsvData(newData);
  };

  const { isDragging } = useDragAndDrop(loadFile);

  // --- DERIVED STATE ---
  const filteredData = useMemo(() => {
    if (!searchTerm) return csvData;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return csvData.filter(row =>
      row.some(cell =>
        cell && cell.toString().toLowerCase().includes(lowercasedSearchTerm)
      )
    );
  }, [csvData, searchTerm]);


  // --- RENDER ---
  return (
    <div
      className={`app ${isDragging ? 'dragging' : ''}`}
      onClick={hideContextMenu}
    >
      <Navbar
        csvData={csvData}
        headers={headers}
        separator={separator}
        searchTerm={searchTerm}
        fileName={fileName}
        onSeparatorChange={handleSeparatorChange}
        onSearchTermChange={setSearchTerm}
        onFileUpload={loadFile}
        onFindAndReplaceClick={() => setShowFindAndReplaceModal(true)}
      />

      {csvData.length > 0 ? (
        <DataTable
          headers={headers}
          setHeaders={setHeaders}
          data={filteredData}
          setCsvData={setCsvData}
          onCellRightClick={handleCellRightClick}
          onImagePreviewChange={setImagePreview}
        />
      ) : (
        <EmptyState />
      )}

      <ImagePreview {...imagePreview} />

      <ContextMenu
        {...contextMenu}
        headers={headers}
        csvData={csvData}
        setCsvData={setCsvData}
        setHeaders={setHeaders}
        hideContextMenu={hideContextMenu}
      />

      <FindAndReplaceModal
        show={showFindAndReplaceModal}
        onClose={() => setShowFindAndReplaceModal(false)}
        onFindAndReplace={handleFindAndReplace}
      />

      {fileName && (
        <footer className="footer">
          <div>{fileName}</div>
        </footer>
      )}
    </div>
  );
}

export default App;
