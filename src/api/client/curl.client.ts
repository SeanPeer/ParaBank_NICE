import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class CurlClient {
    async post(url: string, headers?: Record<string, string>): Promise<string> {
        const args = ['--silent', '--show-error', '--request', 'POST', url];

        if (headers) {
            for (const [key, value] of Object.entries(headers)) {
                args.push('--header', `${key}: ${value}`);
            }
        }

        try {
            const { stdout, stderr } = await execFileAsync('curl', args, {
                windowsHide: true,
            });

            if (stderr?.trim()) {
                console.warn(`[CurlClient] stderr: ${stderr}`);
            }

            return stdout;
        } catch (error) {
            throw new Error(
                `[CurlClient] Failed to execute curl POST ${url}. Original error: ${String(error)}`
            );
        }
    }
}