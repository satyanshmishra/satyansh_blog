/**
 * "Write to me" form → Google Sheet
 * Paste this whole file into Extensions > Apps Script of your Google Sheet,
 * then Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).
 * Copy the Web App URL into js/config.js → formEndpoint.
 */
const SHEET_NAME = 'Messages';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const p = (e && e.parameter) || {};
    if (p.website) return reply({ ok: true });            // spam trap field was filled
    if (!p.name || !p.message) return reply({ ok: false });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Received', 'Name', 'They are', 'Contact', 'Message', 'Page']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), clean(p.name, 80), clean(p.role, 60), clean(p.contact, 120), clean(p.message, 3000), clean(p.page, 200)]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return reply({ ok: true, note: 'Form endpoint is live.' }); }

// Trim, and stop a message from being read as a spreadsheet formula.
function clean(v, max) {
  v = String(v || '').trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
