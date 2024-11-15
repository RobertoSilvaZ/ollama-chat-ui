import Dexie from 'dexie';
import { db } from './index';

export async function migrateDatabase() {
    try {
        // Only migrate if needed
        const dbExists = await Dexie.exists('ChatDatabase');
        if (!dbExists) {
            await db.open();
            console.log('Database created successfully');
            return;
        }

        // Check current version
        const currentVersion = await getCurrentVersion();
        if (currentVersion < 3) {
            await db.version(3).stores({
                topics: '++id, title, createdAt, modelId',
                messages: '++id, topicId, content, isUser, modelId, createdAt',
                images: '++id, prompt, createdAt, upscaleScale'
            }).upgrade(tx => {
                // No need to migrate data since upscaleScale is a new field
                console.log('Database upgraded to version 3');
            });
        }

        await db.open();
        console.log('Database migration completed successfully');
    } catch (error) {
        console.error('Database migration failed:', error);
    }
}

async function getCurrentVersion() {
    try {
        const db = new Dexie('ChatDatabase');
        await db.open();
        return db.verno;
    } catch (error) {
        return 0;
    }
}