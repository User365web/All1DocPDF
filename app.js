(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const grid = $('#toolGrid'), modal = $('#toolModal'), fields = $('#toolFields'), status = $('#statusMessage');
  const toolInfo = {
    compress: { title: 'Compress PDF', description: 'Reduce PDF size by converting pages to optimized images. This can reduce size, but it flattens text and may lower quality.', action: 'Compress PDF', accept: '.pdf,application/pdf', multiple: false },
    image: { title: 'Image to PDF', description: 'Combine multiple JPG, PNG, or WebP images into one downloadable PDF.', action: 'Create PDF', accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp', multiple: true },
    images: { title: 'Image to PDF', description: 'Choose one or more images and combine them into a PDF document.', action: 'Convert images', accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp', multiple: true },
    merge: { title: 'Merge PDF', description: 'Combine PDF documents in the order you select them.', action: 'Merge PDFs', accept: '.pdf,application/pdf', multiple: true },
    split: { title: 'Split PDF', description: 'Extract specific pages into a new PDF. Use commas and ranges, for example 1,3-5.', action: 'Extract pages', accept: '.pdf,application/pdf', multiple: false },
    rotate: { title: 'Rotate PDF', description: 'Rotate every page in your document and download the updated PDF.', action: 'Rotate PDF', accept: '.pdf,application/pdf', multiple: false },
    pages: { title: 'PDF page count', description: 'Check the total number of pages in your PDF.', action: 'Check pages', accept: '.pdf,application/pdf', multiple: false },
    info: { title: 'PDF information', description: 'Inspect basic details about a PDF file in your browser.', action: 'Show information', accept: '.pdf,application/pdf', multiple: false }
  };
  let activeTool = null;
  if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  $('#year').textContent = new Date().getFullYear();

  // Search and category filters
  const search = $('#toolSearch');
  let activeCategory = 'All tools';
  function filterTools() {
    const query = search.value.trim().toLowerCase(); let visible = 0;
    [...grid.querySelectorAll('.tool-card')].forEach(card => {
      const matchesQuery = card.innerText.toLowerCase().includes(query);
      const matchesCategory = activeCategory === 'All tools' || card.dataset.category === activeCategory;
      card.hidden = !(matchesQuery && matchesCategory); if (!card.hidden) visible++;
    });
    $('#emptySearch').hidden = visible !== 0;
  }
  search.addEventListener('input', filterTools);
  document.querySelectorAll('.category-pill').forEach(pill => pill.addEventListener('click', () => {
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active'); activeCategory = pill.textContent.trim(); filterTools();
  }));

  function setStatus(message, kind='') { status.textContent = message; status.className = 'status-message' + (kind ? ' ' + kind : ''); }
  function openTool(key) {
    activeTool = key; const info = toolInfo[key]; if (!info) return;
    $('#modalTitle').textContent = info.title; $('#modalDescription').textContent = info.description;
    fields.innerHTML = `<label class="field-label">${info.multiple ? 'Choose your files' : 'Choose a file'}</label>
      <label class="file-drop"><span class="upload-symbol">↑</span><strong>Click to select ${info.multiple ? 'files' : 'a file'}</strong><small>Browse files on your device</small><input id="fileInput" type="file" accept="${info.accept}" ${info.multiple ? 'multiple' : ''}></label>
      <div class="file-list" id="fileList">No files selected yet.</div>`;
    if (key === 'split') fields.insertAdjacentHTML('beforeend', '<label class="field-label" for="pagesInput">Pages to extract</label><input class="field-input" id="pagesInput" type="text" placeholder="Example: 1,3-5"><div class="field-help">Page numbers start at 1. Ranges are inclusive.</div>');
    if (key === 'rotate') fields.insertAdjacentHTML('beforeend', '<label class="field-label" for="rotateAngle">Rotation angle</label><select class="field-select" id="rotateAngle"><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">270° clockwise</option></select>');
    if (key === 'compress') fields.insertAdjacentHTML('beforeend', '<label class="field-label" for="quality">Compression quality</label><select class="field-select" id="quality"><option value="0.48">Strong compression — smaller file, lower quality</option><option value="0.65" selected>Balanced — recommended</option><option value="0.82">High quality — larger file</option></select><div class="field-help">This creates an image-based PDF. Text will no longer be selectable or searchable.</div>');
    if (key === 'image' || key === 'images') fields.insertAdjacentHTML('beforeend', '<label class="field-label" for="pageSize">PDF page size</label><select class="field-select" id="pageSize"><option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit page to each image</option></select><div class="field-help">Images are placed proportionally; large images may be scaled to fit.</div>');
    $('#runTool').innerHTML = `${info.action} <span>→</span>`; $('#runTool').disabled = false; setStatus(''); modal.hidden = false; document.body.style.overflow = 'hidden';
    $('#fileInput').addEventListener('change', (e) => {
      const files = [...e.target.files];
      $('#fileList').textContent = files.length ? files.map((f,i) => `${i+1}. ${f.name} (${formatBytes(f.size)})`).join('\n') : 'No files selected yet.';
      setStatus('');
    });
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; activeTool = null; }
  grid.addEventListener('click', e => { const card = e.target.closest('.tool-card'); if (card) openTool(card.dataset.tool); });
  $('#closeModal').addEventListener('click', closeModal); $('#cancelTool').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  $('#runTool').addEventListener('click', runActiveTool);
  function formatBytes(n) { if (n < 1024) return n + ' B'; if (n < 1024*1024) return (n/1024).toFixed(1)+' KB'; return (n/(1024*1024)).toFixed(2)+' MB'; }
  function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
  function safeName(file, suffix='') { return (file.name.replace(/\.pdf$/i,'').replace(/[^a-z0-9-_]+/gi,'_') || 'document') + suffix + '.pdf'; }
  function getFiles() { return [...($('#fileInput')?.files || [])]; }
  async function runActiveTool() {
    const files = getFiles();
    if (!files.length) { setStatus('Please choose a file first.', 'error'); return; }
    const key = activeTool; $('#runTool').disabled = true; $('#runTool').textContent = 'Working…'; setStatus('Preparing your document…');
    try {
      if (key === 'merge') await mergePdfs(files);
      else if (key === 'split') await splitPdf(files[0]);
      else if (key === 'rotate') await rotatePdf(files[0]);
      else if (key === 'pages' || key === 'info') await inspectPdf(files[0], key);
      else if (key === 'image' || key === 'images') await imagesToPdf(files);
      else if (key === 'compress') await compressPdf(files[0]);
    } catch (err) {
      console.error(err); setStatus('Could not process this file. It may be password-protected, damaged, or too large for your device. ' + (err?.message || ''), 'error');
    } finally {
      $('#runTool').disabled = false; $('#runTool').innerHTML = `${toolInfo[key]?.action || 'Process'} <span>→</span>`;
    }
  }
  async function mergePdfs(files) {
    if (files.length < 2) throw new Error('Select at least two PDF files to merge.');
    setStatus('Merging ' + files.length + ' documents…'); const merged = await PDFLib.PDFDocument.create();
    for (const file of files) { const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer()); const pages = await merged.copyPages(doc, doc.getPageIndices()); pages.forEach(p => merged.addPage(p)); }
    const bytes = await merged.save({ useObjectStreams: true }); downloadBlob(new Blob([bytes], {type:'application/pdf'}), 'merged_document.pdf'); setStatus(`Done! ${files.length} PDFs were combined.`, 'success');
  }
  async function splitPdf(file) {
    const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer()); const total = doc.getPageCount();
    const raw = ($('#pagesInput')?.value || '').trim(); if (!raw) throw new Error('Enter the page numbers to extract, such as 1,3-5.');
    const selected = new Set();
    for (const part of raw.split(',')) { const p = part.trim(); const range = p.match(/^(\d+)\s*-\s*(\d+)$/); if (range) { let a=+range[1], b=+range[2]; if(a>b)[a,b]=[b,a]; if(a<1||b>total) throw new Error(`Page range must be between 1 and ${total}.`); for(let i=a;i<=b;i++) selected.add(i-1); } else if (/^\d+$/.test(p)) { const n=+p; if(n<1||n>total) throw new Error(`Page number must be between 1 and ${total}.`); selected.add(n-1); } else throw new Error('Use page numbers like 1,3-5.'); }
    if (!selected.size) throw new Error('No valid pages selected.'); setStatus('Extracting pages…'); const out = await PDFLib.PDFDocument.create(); const copied = await out.copyPages(doc, [...selected].sort((a,b)=>a-b)); copied.forEach(p=>out.addPage(p));
    downloadBlob(new Blob([await out.save({useObjectStreams:true})],{type:'application/pdf'}),safeName(file,'_split')); setStatus(`Done! Extracted ${selected.size} page(s).`,'success');
  }
  async function rotatePdf(file) {
    const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer()); const angle = Number($('#rotateAngle').value);
    doc.getPages().forEach(page => page.setRotation(PDFLib.degrees((page.getRotation().angle + angle) % 360)));
    downloadBlob(new Blob([await doc.save({useObjectStreams:true})],{type:'application/pdf'}),safeName(file,'_rotated')); setStatus(`Done! Rotated ${doc.getPageCount()} page(s) by ${angle}°.`, 'success');
  }
  async function inspectPdf(file, key) {
    const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer()); const pages = doc.getPageCount();
    if (key === 'pages') { setStatus(`This PDF contains ${pages} page${pages===1?'':'s'}. File size: ${formatBytes(file.size)}.`, 'success'); }
    else { const title=doc.getTitle() || 'Not specified'; const author=doc.getAuthor() || 'Not specified'; const subject=doc.getSubject() || 'Not specified'; setStatus(`File: ${file.name}\nSize: ${formatBytes(file.size)}\nPages: ${pages}\nTitle: ${title}\nAuthor: ${author}\nSubject: ${subject}`, 'success'); }
  }
  async function imagesToPdf(files) {
    const { jsPDF } = window.jspdf; const mode = $('#pageSize').value; let pdf = null;
    for (let i=0;i<files.length;i++) {
      const file=files[i]; if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not a supported image.`);
      setStatus(`Adding image ${i+1} of ${files.length}…`); const dataUrl = await readAsDataURL(file); const dims = await getImageDimensions(dataUrl);
      let orientation = dims.width > dims.height ? 'landscape' : 'portrait';
      let pageFormat = mode === 'letter' ? 'letter' : 'a4';
      if (mode === 'fit') pageFormat = [Math.max(72,dims.width*0.75), Math.max(72,dims.height*0.75)];
      if (!pdf) pdf = new jsPDF({orientation, unit:'pt', format:pageFormat, compress:true}); else pdf.addPage(pageFormat, orientation);
      const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight(); const margin=mode==='fit'?0:18; const scale=Math.min((pw-margin*2)/dims.width,(ph-margin*2)/dims.height); const w=dims.width*scale,h=dims.height*scale;
      pdf.addImage(dataUrl, file.type==='image/png'?'PNG':'JPEG', (pw-w)/2, (ph-h)/2, w, h, undefined, 'FAST');
    }
    const blob=pdf.output('blob'); downloadBlob(blob,'images_to_pdf.pdf'); setStatus(`Done! Created a PDF from ${files.length} image(s).`, 'success');
  }
  function readAsDataURL(file) { return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Could not read image.'));r.readAsDataURL(file);}); }
  function getImageDimensions(src) { return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve({width:img.naturalWidth,height:img.naturalHeight});img.onerror=()=>reject(new Error('Could not decode one of the images.'));img.src=src;}); }
  async function compressPdf(file) {
    if (!window.pdfjsLib || !window.jspdf) throw new Error('PDF rendering libraries did not load. Check your internet connection and reload.');
    const quality=Number($('#quality').value); setStatus('Opening PDF for image-based compression…'); const loading=pdfjsLib.getDocument({data:await file.arrayBuffer()}); const src=await loading.promise; const {jsPDF}=window.jspdf; let out=null;
    for(let i=1;i<=src.numPages;i++){
      setStatus(`Compressing page ${i} of ${src.numPages}…`); const page=await src.getPage(i); const base=page.getViewport({scale:1}); const maxWidth=quality<0.55?1050:quality<0.75?1400:1800; const scale=Math.min(maxWidth/base.width,2); const viewport=page.getViewport({scale:Math.max(.6,scale)});
      const canvas=document.createElement('canvas'); canvas.width=Math.ceil(viewport.width); canvas.height=Math.ceil(viewport.height); const ctx=canvas.getContext('2d',{alpha:false}); ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height); await page.render({canvasContext:ctx,viewport}).promise;
      const image=canvas.toDataURL('image/jpeg',quality); const orient=base.width>base.height?'landscape':'portrait'; if(!out)out=new jsPDF({orientation:orient,unit:'pt',format:[base.width,base.height],compress:true}); else out.addPage([base.width,base.height],orient); out.addImage(image,'JPEG',0,0,base.width,base.height,undefined,'FAST'); canvas.width=0;canvas.height=0;
    }
    const blob=out.output('blob'); downloadBlob(blob,safeName(file,'_compressed')); const delta=file.size-blob.size; const pct=file.size?Math.round((delta/file.size)*100):0;
    setStatus(`Done! Original: ${formatBytes(file.size)}. New file: ${formatBytes(blob.size)}. ${delta>0?`Size reduced by ${pct}%.`:`The output is ${formatBytes(-delta)} larger than the original.`} Remember: this image-based PDF has no selectable text.`, 'success');
  }
})();
