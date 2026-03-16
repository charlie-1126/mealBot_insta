import { spawn } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import logger from './logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadToInstagram(imagePaths: string[], caption: string): Promise<void> {
    if (!process.env.ID || !process.env.PASSWORD) {
        throw new Error('인스타그램 ID 또는 PASSWORD 환경 변수가 설정되지 않았습니다.');
    }

    if (!imagePaths || imagePaths.length === 0) {
        logger.upload('업로드할 이미지가 없습니다.');
        return;
    }

    logger.upload('인스타그램 업로드 시작');

    return new Promise((resolve, reject) => {
        let pythonScriptPath = path.join(__dirname, 'instagram_upload.py');
        if (!fs.existsSync(pythonScriptPath)) {
            pythonScriptPath = path.join(__dirname, '..', 'src', 'instagram_upload.py');
        }

        const venvPythonPath = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
        const rootVenvPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');

        let pythonCmd = 'python';
        if (fs.existsSync(venvPythonPath)) pythonCmd = venvPythonPath;
        else if (fs.existsSync(rootVenvPython)) pythonCmd = rootVenvPython;

        const pythonProcess = spawn(pythonCmd, [
            pythonScriptPath,
            process.env.ID!,
            process.env.PASSWORD!,
            caption,
            JSON.stringify(imagePaths),
        ]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0 && output.includes('SUCCESS')) {
                logger.upload('업로드 성공');
                resolve();
            } else {
                logger.error(`업로드 중 오류 발생: ${errorOutput || output}`);
                reject(new Error(`Instagram upload failed: ${errorOutput || output}`));
            }
        });
    });
}
