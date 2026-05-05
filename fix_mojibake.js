const fs = require('fs');

const files = [
  'c:/Users/sankr/OneDrive/Resume App/resume-builder/src/components/ImportResumeModal.jsx',
  'c:/Users/sankr/OneDrive/Resume App/resume-builder/src/components/Toast.jsx',
  'c:/Users/sankr/OneDrive/Resume App/resume-builder/src/components/UpgradeModal.jsx',
  'c:/Users/sankr/OneDrive/Resume App/resume-builder/src/components/BuilderPage.jsx',
  'c:/Users/sankr/OneDrive/Resume App/resume-builder/src/components/HomePage.jsx',
];

function fixFile(file) {
  if (!fs.existsSync(file)) { console.log('SKIP (not found):', file); return; }
  let c = fs.readFileSync(file, 'utf8');

  // Step 1: normalize any remaining curly/smart quotes to straight ASCII
  c = c.split('“').join('"').split('”').join('"');
  c = c.split('‘').join("'").split('’').join("'");

  // Step 2: fix mojibake sequences (UTF-8 bytes misread as Windows-1252, re-saved as UTF-8)
  // Each mojibake triple is: decoded Windows-1252 chars for the original UTF-8 bytes
  // After step 1, the quotes inside mojibake sequences are now straight.

  // em dash U+2014 (E2 80 94): â (U+00E2) + € (U+20AC) + " (U+0022 after step1)
  c = c.split('â€"').join('—');
  // ellipsis U+2026 (E2 80 A6): â (U+00E2) + € (U+20AC) + ¦ (U+00A6)
  c = c.split('â€¦').join('…');
  // bullet U+2022 (E2 80 A2): â (U+00E2) + € (U+20AC) + ¢ (U+00A2)
  c = c.split('â€¢').join('•');
  // en dash U+2013 (E2 80 93): â (U+00E2) + € (U+20AC) + " ... wait 0x93 in CP1252 = U+201C -> " -> after step1 = "
  // So en-dash mojibake after step1 is same pattern as em-dash... but wait:
  // em-dash: E2 80 94 -> 0x94 in CP1252 = U+201D -> " -> after step1 = "
  // en-dash: E2 80 93 -> 0x93 in CP1252 = U+201C -> " -> after step1 = "
  // Both become â€"! We can't distinguish them after step1. Use — for both (em-dash is more common in UI).
  // (already handled above — the U+0022 replacement covers both)

  // middle dot U+00B7 (C2 B7): Â (U+00C2) + · (U+00B7)
  c = c.split('Â·').join('·');
  // right arrow U+2192 (E2 86 92): â (U+00E2) + † (U+2020) + ' (U+0027 after step1)
  c = c.split('â†'').join('→');
  // left arrow U+2190 (E2 86 90): â (U+00E2) + † (U+2020) + \x90 ... skip (rare)
  // copyright U+00A9 (C2 A9): Â (U+00C2) + © (U+00A9) — already correct, skip
  // registered U+00AE (C2 AE): Â (U+00C2) + ® (U+00AE) — already correct, skip

  // Also fix &middot; HTML entity used inside JSX expressions
  c = c.split('&middot;').join('·');

  fs.writeFileSync(file, c, 'utf8');
  console.log('Fixed:', file);
}

for (const f of files) fixFile(f);
console.log('All done.');
