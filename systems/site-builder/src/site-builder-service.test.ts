import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProposalCase } from '@dias/contracts';
import { SiteBuilderService } from './application/site-builder-service';
import { StaticHtmlSiteRenderer } from './infrastructure/static-html-site-renderer';

let tempDir: string;

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'dias-site-test-'));
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function makeService() {
  return new SiteBuilderService(
    new StaticHtmlSiteRenderer({ sitesRoot: tempDir, previewBaseUrl: '/sites' }),
  );
}

function makeCompany(name = 'TestCo', industry = 'restaurants') {
  const entity = ProposalCase.discover({
    companyName: name,
    industry,
    region: 'Lisbon',
    website: 'https://old.example.com',
    source: 'test',
  });
  entity.markEnriched({ contactEmail: 'contact@testco.pt', siteOutdated: true });
  return entity.getData();
}

describe('SiteBuilderService', () => {
  it('builds a simple tier site with a single index page', async () => {
    const service = makeService();
    const company = makeCompany();
    const built = await service.buildSite(company, 'simple');

    expect(built.tier).toBe('simple');
    expect(built.previewUrl).toContain(`${company.id}/index.html`);
    expect(existsSync(join(built.outputPath, 'index.html'))).toBe(true);
    expect(readdirSync(built.outputPath)).toEqual(['index.html']);
  });

  it('embeds company info into the generated page', async () => {
    const service = makeService();
    const company = makeCompany('Pizzaria Bella');
    const built = await service.buildSite(company, 'simple');
    const html = readFileSync(join(built.outputPath, 'index.html'), 'utf8');

    expect(html).toContain('Pizzaria Bella');
    expect(html).toContain('restaurants');
    expect(html).toContain('Lisbon');
    expect(html).toContain('contact@');
  });

  it('builds a complex tier site with multiple pages and navigation', async () => {
    const service = makeService();
    const company = makeCompany();
    const built = await service.buildSite(company, 'complex');

    const files = readdirSync(built.outputPath).sort();
    expect(files).toEqual([
      'about.html',
      'contact.html',
      'index.html',
      'services.html',
      'testimonials.html',
    ]);

    const home = readFileSync(join(built.outputPath, 'index.html'), 'utf8');
    expect(home).toContain('about.html');
    expect(home).toContain('services.html');
    expect(home).toContain('contact.html');
    expect(home).toContain('testimonials.html');
  });

  it('varies the design theme by industry', async () => {
    const service = makeService();
    const restaurants = await service.buildSite(makeCompany('Restaurante X'), 'simple');
    const clinic = await service.buildSite(makeCompany('Clinic Y', 'healthcare'), 'simple');

    const restaurantHtml = readFileSync(join(restaurants.outputPath, 'index.html'), 'utf8');
    const clinicHtml = readFileSync(join(clinic.outputPath, 'index.html'), 'utf8');

    expect(restaurantHtml).not.toEqual(clinicHtml);
  });

  it('includes industry-specific content', async () => {
    const service = makeService();
    const company = makeCompany('Pizzaria Bella');
    const built = await service.buildSite(company, 'simple');
    const html = readFileSync(join(built.outputPath, 'index.html'), 'utf8');

    expect(html).toContain('Fresh ingredients');
    expect(html).toContain('Daily lunch &amp; dinner menu');
    expect(html).toContain('every plate tells a story');
    expect(html).toContain('Pizzaria Bella');
  });

  it('renders rich sections on the single page', async () => {
    const service = makeService();
    const built = await service.buildSite(makeCompany(), 'simple');
    const html = readFileSync(join(built.outputPath, 'index.html'), 'utf8');

    expect(html).toContain('feature-grid');
    expect(html).toContain('services-list');
    expect(html).toContain('quote-grid');
    expect(html).toContain('stats-grid');
    expect(html).toContain('cta-band');
    expect(html).toContain('contact-grid');
  });

  it('honours an explicit theme override', async () => {
    const service = makeService();
    const company = makeCompany('Theme Co');
    const built = await service.buildSite(company, 'simple', 'deep-navy');
    const html = readFileSync(join(built.outputPath, 'index.html'), 'utf8');

    expect(html).toContain('#1e3a8a');
    expect(html).not.toContain('#c2410c');
  });

  it('falls back to the industry theme for unknown theme ids', async () => {
    const service = makeService();
    const company = makeCompany('Restaurante X');
    const built = await service.buildSite(company, 'simple', 'not-a-real-theme');
    const html = readFileSync(join(built.outputPath, 'index.html'), 'utf8');

    expect(html).toContain('#c2410c');
  });

  it('escapes HTML entities in company names', async () => {
    const service = makeService();
    const company = makeCompany('<script>alert("x")</script>');
    const built = await service.buildSite(company, 'simple');
    const html = readFileSync(join(built.outputPath, 'index.html'), 'utf8');

    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });

  it('returns a valid file:// URL', async () => {
    const service = makeService();
    const built = await service.buildSite(makeCompany(), 'simple');
    expect(built.fileUrl.startsWith('file://')).toBe(true);
  });

  it('defaults tier to simple', async () => {
    const service = makeService();
    const built = await service.buildSite(makeCompany());
    expect(built.tier).toBe('simple');
    expect(readdirSync(built.outputPath)).toEqual(['index.html']);
  });
});
