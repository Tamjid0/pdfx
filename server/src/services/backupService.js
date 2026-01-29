import cron from 'node-cron';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const dbDir = path.join(process.cwd(), 'src', 'database');
const backupsDir = path.join(process.cwd(), 'backups');

/**
 * Creates a compressed backup of the database directory
 */
export const performBackup = async () => {
    try {
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const zipName = `db-backup-${timestamp}.zip`;
        const zipPath = path.join(backupsDir, zipName);

        const zip = new AdmZip();

        // Backup the documents directory (where NeDB files are)
        const docDir = path.join(dbDir, 'documents');
        if (fs.existsSync(docDir)) {
            zip.addLocalFolder(docDir, 'documents');
        }

        // Backup the main db.json if it exists
        const mainDb = path.join(dbDir, 'db.json');
        if (fs.existsSync(mainDb)) {
            zip.addLocalFile(mainDb);
        }

        zip.writeZip(zipPath);
        logger.info(`[BackupService] Database backup created: ${zipName}`);

        // Cleanup old backups (keep last 7 days)
        cleanupOldBackups();

        return zipName;
    } catch (error) {
        logger.error(`[BackupService] Backup failed: ${error.message}`);
        throw error;
    }
};

/**
 * Removes backups older than 7 days
 */
const cleanupOldBackups = () => {
    try {
        const files = fs.readdirSync(backupsDir);
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        files.forEach(file => {
            const filePath = path.join(backupsDir, file);
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > maxAge) {
                fs.unlinkSync(filePath);
                logger.info(`[BackupService] Deleted old backup: ${file}`);
            }
        });
    } catch (error) {
        logger.error(`[BackupService] Cleanup failed: ${error.message}`);
    }
};

/**
 * Initializes the backup schedule (Daily at 03:00 AM)
 */
export const initBackupSchedule = () => {
    // 0 3 * * * = 3:00 AM every day
    cron.schedule('0 3 * * *', () => {
        logger.info('[BackupService] Starting scheduled database backup...');
        performBackup();
    });

    logger.info('[BackupService] Database backup schedule initialized (03:00 AM Daily)');
};

export default {
    performBackup,
    initBackupSchedule
};
