import { createServer, Server, IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { DashboardService } from '../application/dashboard-service';
import { renderDashboardPage } from './dashboard-page';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

export class DashboardServer {
  private server: Server | null = null;

  constructor(
    private readonly service: DashboardService,
    private readonly options: { port: number; sitesRoot: string },
  ) {}

  start(): Promise<string> {
    const page = renderDashboardPage();
    this.server = createServer((req, res) => this.handle(req, res, page));

    return new Promise((resolve, reject) => {
      this.server?.once('error', reject);
      this.server?.listen(this.options.port, () => {
        resolve(`http://localhost:${this.options.port}`);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) return resolve();
      this.server.close(() => resolve());
    });
  }

  private async handle(req: IncomingMessage, res: ServerResponse, page: string): Promise<void> {
    const url = new URL(req.url ?? '/', `http://localhost:${this.options.port}`);
    const path = url.pathname;

    try {
      if (req.method === 'GET' && path === '/') {
        this.html(res, 200, page);
        return;
      }

      if (req.method === 'GET' && path === '/api/cases') {
        this.json(res, 200, this.service.listCases());
        return;
      }

      const approveMatch = path.match(/^\/api\/cases\/([^/]+)\/approve$/);
      if (req.method === 'POST' && approveMatch) {
        const id = decodeURIComponent(approveMatch[1]);
        const entity = this.service.approveCase(id, 'dashboard');
        this.json(res, 200, { id, currentState: entity.getData().currentState });
        return;
      }

      if (req.method === 'POST' && path === '/api/run') {
        const body = await readBody(req);
        const params = JSON.parse(body || '{}');
        if (url.searchParams.get('mode') === 'stage') {
          const summary = await this.service.runPipeline({ ...params, limit: 0 });
          this.json(res, 200, summary);
        } else {
          const summary = await this.service.runPipeline(params);
          this.json(res, 200, summary);
        }
        return;
      }

      if (req.method === 'GET' && path.startsWith('/sites/')) {
        this.serveStatic(res, path);
        return;
      }

      this.json(res, 404, { error: 'Not found' });
    } catch (error) {
      this.json(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private serveStatic(res: ServerResponse, path: string): void {
    const relative = normalize(path.slice('/sites/'.length));
    const filePath = join(this.options.sitesRoot, relative);
    if (!filePath.startsWith(normalize(this.options.sitesRoot)) || !existsSync(filePath)) {
      this.json(res, 404, { error: 'Not found' });
      return;
    }
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
    });
    res.end(readFileSync(filePath));
  }

  private html(res: ServerResponse, status: number, content: string): void {
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  }

  private json(res: ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
