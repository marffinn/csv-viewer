import { useState, useRef, useMemo, useEffect } from 'react'
import Papa from 'papaparse'
import { Upload, Download, Search } from 'lucide-react'
import ThemeSwitch from './ThemeSwitch'
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
  const [rawFileContent, setRawFileContent] = useState('')
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 })
  const [isDragging, setIsDragging] = useState(false)
  const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 })
  const [darkTheme, setDarkTheme] = useState(true)
  const [editingHeader, setEditingHeader] = useState(-1)
  const [editHeaderValue, setEditHeaderValue] = useState('')
  const fileInputRef = useRef(null)
  const appRef = useRef(null)

  const detectSeparator = (content) => {
    const separators = [';', ',', '\t']
    const firstLine = content.split('\n')[0]
    let bestSeparator = ';'
    let maxColumns = 0

    separators.forEach(sep => {
      const columns = firstLine.split(sep).length
      if (columns > maxColumns) {
        maxColumns = columns
        bestSeparator = sep
      }
    })

    return bestSeparator
  }

  const parseCSVContent = (content, delimiter) => {
    return new Promise((resolve) => {
      Papa.parse(content, {
        delimiter,
        header: false,
        complete: (results) => {
          if (results.data.length > 0) {
            resolve({
              headers: results.data[0],
              data: results.data.slice(1)
            })
          } else {
            resolve({ headers: [], data: [] })
          }
        }
      })
    })
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    await loadFile(file)
  }

  const handleSeparatorChange = async (newSeparator) => {
    setSeparator(newSeparator)
    if (rawFileContent) {
      const parsed = await parseCSVContent(rawFileContent, newSeparator)
      setHeaders(parsed.headers)
      setCsvData(parsed.data)
    }
  }

  const handleCellRightClick = (e, rowIndex, colIndex) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      rowIndex,
      colIndex
    })
  }

  const addRowAbove = (index) => {
    const newRow = new Array(headers.length).fill('')
    const newData = [...csvData]
    newData.splice(index, 0, newRow)
    setCsvData(newData)
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 })
  }

  const addRowBelow = (index) => {
    const newRow = new Array(headers.length).fill('')
    const newData = [...csvData]
    newData.splice(index + 1, 0, newRow)
    setCsvData(newData)
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 })
  }

  const deleteRow = (index) => {
    const newData = csvData.filter((_, i) => i !== index)
    setCsvData(newData)
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 })
  }

  const addColumnBefore = (index) => {
    const newHeaders = [...headers]
    newHeaders.splice(index, 0, 'New Column')
    setHeaders(newHeaders)
    const newData = csvData.map(row => {
      const newRow = [...row]
      newRow.splice(index, 0, '')
      return newRow
    })
    setCsvData(newData)
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 })
  }

  const addColumnAfter = (index) => {
    const newHeaders = [...headers]
    newHeaders.splice(index + 1, 0, 'New Column')
    setHeaders(newHeaders)
    const newData = csvData.map(row => {
      const newRow = [...row]
      newRow.splice(index + 1, 0, '')
      return newRow
    })
    setCsvData(newData)
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 })
  }

  const deleteColumn = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index)
    setHeaders(newHeaders)
    const newData = csvData.map(row => row.filter((_, i) => i !== index))
    setCsvData(newData)
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, colIndex: -1 })
  }

  const hideContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1 })
  }

  const loadFile = async (file) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setFileName(file.name)
      const content = await file.text()
      setRawFileContent(content)

      const detectedSeparator = detectSeparator(content)
      setSeparator(detectedSeparator)

      const parsed = await parseCSVContent(content, detectedSeparator)
      setHeaders(parsed.headers)
      setCsvData(parsed.data)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    await loadFile(file)
  }

  const handleCellEdit = (rowIndex, colIndex) => {
    setEditingCell({ row: rowIndex, col: colIndex })
    setEditValue(csvData[rowIndex][colIndex] || '')
  }

  const handleCellClick = (rowIndex, colIndex) => {
    setSelectedCell({ row: rowIndex, col: colIndex })
  }

  const handleKeyDown = (e) => {
    if (editingCell) return
    if (selectedCell.row === -1 || selectedCell.col === -1) return

    let newRow = selectedCell.row
    let newCol = selectedCell.col

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        newRow = Math.max(0, selectedCell.row - 1)
        break
      case 'ArrowDown':
        e.preventDefault()
        newRow = Math.min(filteredData.length - 1, selectedCell.row + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        newCol = Math.max(0, selectedCell.col - 1)
        break
      case 'ArrowRight':
        e.preventDefault()
        newCol = Math.min(headers.length - 1, selectedCell.col + 1)
        break
      case 'Enter':
        e.preventDefault()
        handleCellEdit(selectedCell.row, selectedCell.col)
        return
      default:
        return
    }

    setSelectedCell({ row: newRow, col: newCol })
  }

  const handleSaveEdit = () => {
    if (editingCell) {
      const newData = [...csvData]
      newData[editingCell.row][editingCell.col] = editValue
      setCsvData(newData)
      setSelectedCell({ row: editingCell.row, col: editingCell.col })
      setEditingCell(null)
      setEditValue('')
      setTimeout(() => appRef.current?.focus(), 0)
    }
  }

  const handleHeaderEdit = (index) => {
    setEditingHeader(index)
    setEditHeaderValue(headers[index] || '')
  }

  const handleSaveHeader = () => {
    if (editingHeader !== -1) {
      const newHeaders = [...headers]
      newHeaders[editingHeader] = editHeaderValue
      setHeaders(newHeaders)
      setEditingHeader(-1)
      setEditHeaderValue('')
    }
  }

  const handleDownload = (overwrite = false) => {
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell || ''}"`).join(separator))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = overwrite && fileName ? fileName : (fileName || 'data.csv')
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

  useEffect(() => {
    const existingScript = document.querySelector('script[data-name="bmc-button"]')
    if (existingScript) {
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js'
    script.dataset.name = 'bmc-button'
    script.dataset.slug = 'marffinnz'
    script.dataset.color = '#5F7FFF'
    script.dataset.emoji = '🌮'
    script.dataset.font = 'Cookie'
    script.dataset.text = 'Buy me a kebab'
    script.dataset.outlineColor = '#000000'
    script.dataset.fontColor = '#ffffff'
    script.dataset.coffeeColor = '#FFDD00'
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

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
    <div
      ref={appRef}
      className={`app ${isDragging ? 'dragging' : ''} ${darkTheme ? 'dark' : ''}`}
      onClick={hideContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <nav className="navbar">
        <div className="nav-brand">
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
            <select className="form-select" value={separator} onChange={(e) => handleSeparatorChange(e.target.value)}>
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


        </div>
      </nav>

      {csvData.length > 0 ? (
        <div className="table-container">
          <table className="csv-table">
            <thead>
              <tr>
                <th className="row-header"></th>
                {headers.map((header, index) => (
                  <th key={index} style={{ resize: 'horizontal', overflow: 'hidden' }}>
                    {editingHeader === index ? (
                      <input
                        value={editHeaderValue}
                        onChange={(e) => setEditHeaderValue(e.target.value)}
                        onBlur={handleSaveHeader}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveHeader()
                          if (e.key === 'Escape') {
                            setEditingHeader(-1)
                            setEditHeaderValue('')
                          }
                        }}
                        autoFocus
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}
                      />
                    ) : (
                      <div onDoubleClick={() => handleHeaderEdit(index)} style={{ cursor: 'pointer' }}>
                        {header}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="row-header">{rowIndex + 1}</td>
                  {headers.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className={selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'selected' : ''}
                      onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                    >
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
                        <div
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          onDoubleClick={() => handleCellEdit(rowIndex, colIndex)}
                        >
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

      {contextMenu.show && (
        <div
          className="context-menu"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={() => addRowAbove(contextMenu.rowIndex)}>
            Add Row Above
          </div>
          <div className="context-menu-item" onClick={() => addRowBelow(contextMenu.rowIndex)}>
            Add Row Below
          </div>
          <div className="context-menu-item" onClick={() => deleteRow(contextMenu.rowIndex)}>
            Delete Row
          </div>
          <div className="context-menu-divider"></div>
          <div className="context-menu-item" onClick={() => addColumnBefore(contextMenu.colIndex)}>
            Add Column Before
          </div>
          <div className="context-menu-item" onClick={() => addColumnAfter(contextMenu.colIndex)}>
            Add Column After
          </div>
          <div className="context-menu-item" onClick={() => deleteColumn(contextMenu.colIndex)}>
            Delete Column
          </div>
        </div>
      )}

      {fileName && (
        <footer className="footer">
          <div>{fileName}</div>
          <ThemeSwitch checked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
        </footer>
      )}
    </div>
  )
}

export default App