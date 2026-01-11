import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import logger from '../utils/logger.js';

const execPromise = promisify(exec);

/**
 * Service to handle document conversions using LibreOffice (soffice).
 * Requires LibreOffice to be installed in the environment (e.g. via Docker).
 */
class LibreOfficeService {
    /**
     * Converts a PPTX/PPT file to PDF.
     * @param {string} inputPath - Absolute path to the source file.
     * @param {string} outputDir - Directory where the PDF should be saved.
     * @returns {Promise<string>} - Path to the generated PDF.
     */
    async convertToPdf(inputPath, outputDir) {
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputPath}`);
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = path.parse(inputPath).name;
        const pdfPath = path.join(outputDir, `${fileName}.pdf`);

        logger.info(`Converting ${inputPath} to PDF via LibreOffice...`);

        try {
            // Command: soffice --headless --convert-to pdf --outdir [outdir] [input]
            // Note: In Windows, it might be "soffice.exe" or full path. 
            // In Docker (Linux), it's "soffice".
            const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

            const { stdout, stderr } = await execPromise(command);

            if (stderr && !stderr.includes('Warning')) {
                logger.warn(`LibreOffice stderr: ${stderr}`);
            }

            if (!fs.existsSync(pdfPath)) {
                throw new Error(`Conversion failed: PDF not found at ${pdfPath}`);
            }

            logger.info(`Conversion successful: ${pdfPath}`);
            return pdfPath;
        } catch (error) {
            logger.error(`LibreOffice conversion error: ${error.message}`);
            throw new Error('Failed to convert presentation to PDF. Ensure LibreOffice is installed.');
        }
    }
}

export default new LibreOfficeService();
