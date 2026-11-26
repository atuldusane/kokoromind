/*
 * "Help us do better" feedback form. Answers go to a Google Form in the
 * background, so they land in its Google Sheet; parents never leave the page.
 *
 * To connect: put the Google Form's formResponse address and the entry ids
 * of its three questions below. Until then the section stays hidden.
 */
(() => {
  const FORM = {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSdMNLSHQm2yz5R3rFMFhU_IMUmzgMUyEsur2tU4sxVNGhP0SA/formResponse',
    fields: {
      reason: 'entry.818282441', // What stopped you from enrolling?
      better: 'entry.1045898344', // Anything we could do better?
      email: 'entry.966829626', // Email, if you'd like a reply
    },
  };

  const section = document.querySelector('#feedback');
  const footLink = document.querySelector('.foot .legal a[href="#feedback"]');
  if (!section) return;
  if (!FORM.action || !FORM.fields.reason) return; // not connected yet: stay hidden
  section.hidden = false;
  if (footLink) footLink.hidden = false;

  const form = section.querySelector('form');
  const status = section.querySelector('.fb-status');
  const button = form.querySelector('button[type=submit]');
  const reasonError = form.querySelector('#fb-reason-error');

  form.addEventListener('change', (e) => {
    if (e.target.name === 'reason') { reasonError.hidden = true; form.querySelector('fieldset').removeAttribute('aria-invalid'); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.website.value) return; // spam trap
    const reason = form.querySelector('input[name=reason]:checked');
    if (!reason) {
      reasonError.hidden = false;
      form.querySelector('fieldset').setAttribute('aria-invalid', 'true');
      form.querySelector('input[name=reason]').focus();
      return;
    }
    const email = form.elements.email;
    if (email.value && !email.checkValidity()) { email.reportValidity(); return; }

    const data = new URLSearchParams();
    data.append(FORM.fields.reason, reason.value);
    if (FORM.fields.better) data.append(FORM.fields.better, form.elements.better.value.trim() || '(left blank)'); // the Google Form marks this required
    if (FORM.fields.email) data.append(FORM.fields.email, email.value.trim());

    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      // Google Forms does not allow reading the reply, so a sent request counts as delivered
      await fetch(FORM.action, { method: 'POST', mode: 'no-cors', body: data });
      form.hidden = true;
      status.innerHTML = '<b>Thank you!</b> We read every message.';
      status.hidden = false;
      status.focus();
    } catch (err) {
      button.disabled = false;
      button.textContent = 'Send feedback';
      status.innerHTML = 'That did not send. Check your connection and try again, or email <a href="mailto:kokoromind.info@gmail.com">kokoromind.info@gmail.com</a>.';
      status.hidden = false;
    }
  });
})();
