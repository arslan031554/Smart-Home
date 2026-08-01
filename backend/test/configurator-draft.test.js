import assert from 'assert';
import sequelize from '../src/config/database.js';
import ConfiguratorDraft from '../models/ConfiguratorDraft.js';
import User from '../models/User.js';
import { upsertCurrentDraft } from '../src/services/configuratordraftservice.js';

async function runTest() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        
        // 1. Create a dummy user
        const dummyEmail = 'test-concurrent-' + Date.now() + '@example.com';
        const user = await User.create({
            email: dummyEmail,
            fullName: 'Test Concurrent',
            passwordHash: 'dummy',
            role: 'customer'
        });
        console.log('Dummy user created:', user.id);

        const snapshotInput = {
            projectInfo: { name: 'Concurrent Test Project' },
            currentStep: 2
        };

        // 2. Simulate 5 concurrent requests
        console.log('Firing 5 concurrent upsertCurrentDraft requests...');
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(upsertCurrentDraft({
                userId: user.id,
                snapshotInput
            }).catch(e => console.error('Error in concurrent request:', e.message)));
        }

        await Promise.all(promises);

        // 3. Assert that there is exactly 1 active draft for this user
        const drafts = await ConfiguratorDraft.findAll({
            where: { userId: user.id, configurationStatus: 'active' }
        });

        console.log(`Active drafts found: ${drafts.length}`);
        assert.strictEqual(drafts.length, 1, 'There should be exactly 1 active draft');

        console.log('TEST PASSED: Concurrency handled correctly via transactions + locks.');
        
        // Cleanup
        await ConfiguratorDraft.destroy({ where: { userId: user.id } });
        await User.destroy({ where: { id: user.id } });
    } catch (e) {
        console.error('TEST FAILED:', e);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

runTest();
