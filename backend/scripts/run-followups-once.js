import dotenv from 'dotenv';
import { processFollowups } from '../src/services/followupservice.js';

dotenv.config();

async function main() {
    console.log('Running follow-up processor once...');
    await processFollowups();
    console.log('Follow-up processor completed.');
}

main().catch((error) => {
    console.error('Follow-up processor failed:', error);
    process.exit(1);
});
