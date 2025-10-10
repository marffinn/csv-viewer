import { useState, useRef, useMemo } from 'react'
import Papa from 'papaparse'
import { Upload, Download, Search } from 'lucide-react'
import './App.css'

function App() {
  const [csvData, setCsvData] = useState([])
  const [headers, setHeaders] = useState([])
  const [separator, setSeparator] = useState(';')
  const [categorySeparator, setCategorySeparator] = useState('>')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [fileName, setFileName] = useState('')
  const [imagePreview, setImagePreview] = useState({ show: false, url: '', x: 0, y: 0 })
  const fileInputRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFileName(file.name)
      Papa.parse(file, {
        delimiter: separator,
        header: false,
        complete: (results) => {
          if (results.data.length > 0) {
            setHeaders(results.data[0])
            setCsvData(results.data.slice(1))
          }
        }
      })
    }
  }

  const handleCellEdit = (rowIndex, colIndex) => {
    setEditingCell({ row: rowIndex, col: colIndex })
    setEditValue(csvData[rowIndex][colIndex] || '')
  }

  const handleSaveEdit = () => {
    if (editingCell) {
      const newData = [...csvData]
      newData[editingCell.row][editingCell.col] = editValue
      setCsvData(newData)
      setEditingCell(null)
      setEditValue('')
    }
  }

  const handleDownload = () => {
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell || ''}"`).join(separator))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredData = useMemo(() => {
    if (!searchTerm) return csvData
    return csvData.filter(row =>
      row.some(cell =>
        cell && cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [csvData, searchTerm])

  const isImageUrl = (text) => {
    if (!text) return false
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(text) || text.includes('image')
  }

  const handleMouseEnter = (e, content) => {
    if (isImageUrl(content)) {
      const x = e.clientX + 10
      const y = e.clientY + 220 > window.innerHeight ? e.clientY - 210 : e.clientY + 10
      setImagePreview({
        show: true,
        url: content,
        x,
        y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (imagePreview.show) {
      const x = e.clientX + 10
      const y = e.clientY + 220 > window.innerHeight ? e.clientY - 210 : e.clientY + 10
      setImagePreview(prev => ({
        ...prev,
        x,
        y
      }))
    }
  }

  const handleMouseLeave = () => {
    setImagePreview({ show: false, url: '', x: 0, y: 0 })
  }

  const formatCellContent = (content) => {
    if (!content) return ''

    if (isImageUrl(content)) {
      return (
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="image-link"
          onMouseEnter={(e) => handleMouseEnter(e, content)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </a>
      )
    }

    if (content.includes(categorySeparator)) {
      return content.split(categorySeparator).map((part, index) => (
        <span key={index}>
          {index > 0 && <span style={{ color: '#e74c3c', fontWeight: 'bold' }}> {categorySeparator} </span>}
          <span>{part.trim()}</span>
        </span>
      ))
    }
    return content
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <img src="/logo Starfix - wersja z cieniem RGB - białe tło i carna obwódka i napis czarny.png" alt="Logo" className="logo" />
          CSV Viewer
        </div>
        <div className="nav-controls">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
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
            <select className="form-select" value={separator} onChange={(e) => setSeparator(e.target.value)}>
              <option value=";">Semicolon (;)</option>
              <option value=",">Comma (,)</option>
              <option value="\t">Tab</option>
            </select>
          </div>

          <div className="control-group">
            <label>Category Separator</label>
            <select className="form-select" value={categorySeparator} onChange={(e) => setCategorySeparator(e.target.value)}>
              <option value=">">Arrow (&gt;)</option>
              <option value="|">Pipe (|)</option>
              <option value="/">Slash (/)</option>
              <option value="-">Dash (-)</option>
            </select>
          </div>

          {csvData.length > 0 && (
            <div className="control-group">
              <label>Search Data</label>
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          {fileName && (
            <div className="control-group">
              <label>Current File</label>
              <div className="file-info">{fileName}</div>
            </div>
          )}
        </div>
      </nav>

      {csvData.length > 0 ? (
        <div className="table-container">
          <table className="csv-table">
            <thead>
              <tr>
                <th className="row-header"></th>
                {headers.map((header, index) => (
                  <th key={index} style={{ resize: 'horizontal', overflow: 'hidden' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="row-header">{rowIndex + 1}</td>
                  {headers.map((_, colIndex) => (
                    <td key={colIndex}>
                      {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit()
                            if (e.key === 'Escape') {
                              setEditingCell(null)
                              setEditValue('')
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <div onClick={() => handleCellEdit(rowIndex, colIndex)}>
                          {formatCellContent(row[colIndex])}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <Upload size={48} />
          <h2>No CSV file loaded</h2>
          <p>Click "Open" to load a CSV file</p>
        </div>
      )}

      {imagePreview.show && (
        <div
          className="image-preview"
          style={{
            left: imagePreview.x,
            top: imagePreview.y
          }}
        >
          <img src={imagePreview.url} alt="Preview" />
        </div>
      )}
    </div>
  )
}

export default App