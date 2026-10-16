/* Before publishing, replace the placeholder below with an email address you control. */
const ALL1DOCPDF_CONTACT_EMAIL = 'REPLACE_WITH_YOUR_REAL_EMAIL@example.com';
const form = document.getElementById('contactForm');
const status = document.getElementById('contactStatus');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (ALL1DOCPDF_CONTACT_EMAIL.includes('REPLACE_WITH_YOUR_REAL_EMAIL') || !ALL1DOCPDF_CONTACT_EMAIL.includes('@')) {
    status.textContent = 'The site owner must configure a real contact email in contact.js before this form can be used.';
    status.style.color = '#d34d52';
    return;
  }
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const topic = String(data.get('topic') || 'General feedback');
  const message = String(data.get('message') || '').trim();
  const subject = encodeURIComponent(`[All1DocPDF] ${topic}`);
  const body = encodeURIComponent(`Name: ${name || 'Not provided'}\nReply email: ${email}\nTopic: ${topic}\n\n${message}`);
  status.textContent = 'Opening your email application. Review the message and press Send there.';
  status.style.color = '#19845f';
  window.location.href = `mailto:${ALL1DOCPDF_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});
