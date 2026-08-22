const fs = require('fs');
const file = 'e:/wireeo/SmartHomeConfiguratorFinal/Smart-Home/backend/src/server.js';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

// 0-indexed, so lines 225 to 447 correspond to indices 224 to 446
// Wait, the duplicate block starts at line 225 (index 224) and goes up to line 447 (index 446).
// Let's verify line 225 is indeed createOfferFollowupsTable
if (lines[224].includes('createOfferFollowupsTable')) {
    // Delete lines 225 to 447 (inclusive)
    // number of lines to delete is 447 - 225 + 1 = 223
    lines.splice(224, 223);
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Successfully removed lines 225-447');
} else {
    console.log('Error: Line 225 is not createOfferFollowupsTable, it is: ' + lines[224]);
}
