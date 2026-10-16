# All1DocPDF — Free PDF & Document Tools

A responsive, front-end starter website for free PDF utilities. PDF and image processing is performed locally in the visitor's browser. No backend or database is required.

## Included tools

- Compress PDF (image-based compression; lossy and flattens text)
- JPG/PNG/WebP images to PDF
- Merge PDF files
- Split/extract selected PDF pages
- Rotate all pages in a PDF
- PDF page count
- PDF information viewer
- Search and category filters, responsive landing page, FAQ
- About, Privacy Policy, and Contact pages (configure your real contact email in `contact.js` before publishing)

## Quick start (Windows)

1. Install Python 3 from https://www.python.org/downloads/ if you do not already have it. During setup, enable **Add Python to PATH**.
2. Extract the ZIP file to a folder such as `C:\All1DocPDF`.
3. Double-click `start.bat`.
4. Your browser should open `http://localhost:8000`. If it does not, open that address manually.
5. Keep the command window open while using the website. Press Ctrl+C in that window to stop the local server.

Alternative: open a terminal in the extracted folder and run `python -m http.server 8000`, then visit http://localhost:8000.

## Requirements and notes

- A modern browser and internet connection are required because PDF libraries and fonts load from public CDNs.
- Your selected documents are not uploaded to a All1DocPDF server. Browser libraries are downloaded when the page loads; document bytes remain local.
- The compression tool rasterizes every page into a JPEG image. This can shrink scanned or image-heavy PDFs, but may reduce quality and removes selectable/searchable text. It cannot guarantee a smaller file; compare the output with the original.
- PDF-to-Word conversion, password removal, OCR, advanced compression, and server-side conversion are not implemented in this starter version.
- Before public launch, replace the contact email placeholder in `contact.js`, review the privacy policy against your actual hosting and any services you add, consider terms of use, test accessibility, and add analytics/Search Console or a consent solution only if needed for your setup and region. Do not place ads in ways that cause accidental clicks. AdSense approval and traffic are not guaranteed.

## Project structure

- `index.html` — homepage markup and tool cards
- `about.html` — About page
- `privacy.html` — Privacy Policy
- `contact.html` and `contact.js` — contact page and email-launch form
- `legal.css` — shared styles for information pages
- `styles.css` — responsive design
- `app.js` — client-side tool behavior
- `start.bat` — Windows quick-start script
