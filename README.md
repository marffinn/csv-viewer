# CSV Viewer & Editor

A beautiful React application for viewing and editing CSV files with customizable separators.

## Features

- **File Upload**: Upload CSV files from your system
- **Customizable Separators**: 
  - Field separator (semicolon, comma, tab, pipe)
  - Category separator for hierarchical data display
- **Inline Editing**: Click any cell to edit its content
- **Beautiful Table Display**: Responsive table with sticky headers
- **Download**: Export your edited data back to CSV
- **Category Highlighting**: Special formatting for hierarchical categories

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the provided URL (usually `http://localhost:5173`)

## Usage

1. **Upload a CSV file**: Click "Upload CSV" and select your file
2. **Configure separators**: 
   - Set the field separator (default: semicolon `;`)
   - Set the category separator for hierarchical data (default: `>`)
3. **Edit data**: Click on any cell to edit its content
4. **Save changes**: Press Enter to save or Escape to cancel
5. **Download**: Click "Download CSV" to export your edited data

## Sample Data

A sample CSV file (`sample.csv`) is included in the public folder for testing.

## Supported File Formats

- CSV files with various separators
- Files with headers (first row treated as column names)
- Hierarchical category data with custom separators

## Technologies Used

- React 18
- Vite
- PapaParse (CSV parsing)
- Lucide React (icons)
- Modern CSS with responsive design