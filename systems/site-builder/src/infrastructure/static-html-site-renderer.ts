import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ProposalCaseData } from '@dias/contracts';
import { BuiltSite, SiteSpec } from '../domain/types';
import { SiteRenderer } from '../application/ports';

export interface StaticHtmlSiteRendererOptions {
  sitesRoot: string;
  previewBaseUrl: string;
}

export class StaticHtmlSiteRenderer implements SiteRenderer {
  constructor(private readonly options: StaticHtmlSiteRendererOptions) {}

  async render(spec: SiteSpec): Promise<BuiltSite> {
    const outDir = join(this.options.sitesRoot, spec.caseId);
    mkdirSync(outDir, { recursive: true });

    const c = spec.company;
    const tagline = this.taglineFor(c);

    if (spec.tier === 'complex') {
      this.writeFile(outDir, 'index.html', this.page(c, tagline, 'home'));
      this.writeFile(outDir, 'about.html', this.page(c, tagline, 'about'));
      this.writeFile(outDir, 'services.html', this.page(c, tagline, 'services'));
      this.writeFile(outDir, 'contact.html', this.page(c, tagline, 'contact'));
    } else {
      this.writeFile(outDir, 'index.html', this.singlePage(c, tagline));
    }

    return {
      caseId: spec.caseId,
      tier: spec.tier,
      outputPath: outDir,
      previewUrl: `${this.options.previewBaseUrl}/${spec.caseId}/index.html`,
      fileUrl: pathToFileURL(join(outDir, 'index.html')).href,
    };
  }

  private writeFile(dir: string, name: string, content: string): void {
    writeFileSync(join(dir, name), content, 'utf8');
  }

  private taglineFor(c: ProposalCaseData): string {
    const industry = c.industry ?? 'business';
    return `Trusted ${industry} services for ${c.region ?? 'your area'}`;
  }

  private singlePage(c: ProposalCaseData, tagline: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${this.esc(c.companyName)}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; line-height: 1.6; }
header { background: #0f766e; color: #fff; padding: 3rem 1.5rem; text-align: center; }
header h1 { font-size: 2.2rem; }
header p { margin-top: .5rem; opacity: .9; }
main { max-width: 820px; margin: 0 auto; padding: 2rem 1.5rem; }
section { margin-bottom: 2rem; }
h2 { color: #0f766e; margin-bottom: .5rem; }
.card { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: .5rem; padding: 1rem 1.25rem; }
.contact li { margin: .35rem 0; }
footer { text-align: center; padding: 1.5rem; color: #6b7280; font-size: .85rem; }
</style>
</head>
<body>
<header>
  <h1>${this.esc(c.companyName)}</h1>
  <p>${this.esc(tagline)}</p>
</header>
<main>
  <section>
    <h2>About us</h2>
    <p>Welcome to ${this.esc(c.companyName)} — your trusted choice for ${this.esc(c.industry ?? 'professional')} services in ${this.esc(c.region ?? 'your area')}. We are committed to quality, reliability, and customer satisfaction.</p>
  </section>
  <section>
    <h2>Our services</h2>
    <div class="card"><p>Discover the range of ${this.esc(c.industry ?? 'professional')} services we offer, tailored to the needs of the local community.</p></div>
  </section>
  <section>
    <h2>Contact us</h2>
    <ul class="contact">
      ${c.contactEmail ? `<li>Email: <a href="mailto:${this.esc(c.contactEmail)}">${this.esc(c.contactEmail)}</a></li>` : ''}
      ${c.contactPhone ? `<li>Phone: ${this.esc(c.contactPhone)}</li>` : ''}
      ${c.website ? `<li>Visit: <a href="${this.esc(c.website)}">${this.esc(c.website)}</a></li>` : ''}
    </ul>
  </section>
</main>
<footer>&copy; ${new Date().getFullYear()} ${this.esc(c.companyName)}</footer>
</body>
</html>`;
  }

  private page(c: ProposalCaseData, tagline: string, active: string): string {
    const nav = (page: string, label: string) =>
      `<a href="${page}.html"${page === active ? ' class="active"' : ''}>${label}</a>`;
    const body: Record<string, string> = {
      home: `<section><h2>Welcome</h2><p>Welcome to ${this.esc(c.companyName)} — your trusted choice for ${this.esc(c.industry ?? 'professional')} services in ${this.esc(c.region ?? 'your area')}.</p></section><section class="card"><h2>Why choose us</h2><p>Local expertise, modern service, and a commitment to your satisfaction on every project.</p></section>`,
      about: `<section><h2>About us</h2><p>${this.esc(c.companyName)} has been serving ${this.esc(c.region ?? 'the community')} with dependable ${this.esc(c.industry ?? 'professional')} services. Our team brings experience, care, and attention to detail to every engagement.</p></section>`,
      services: `<section><h2>Our services</h2><p>We offer a full range of ${this.esc(c.industry ?? 'professional')} services tailored to the needs of the local community.</p></section><section class="card"><h2>Get in touch</h2><p>Contact us to discuss how we can help your next project.</p></section>`,
      contact: `<section><h2>Contact us</h2><ul class="contact">${c.contactEmail ? `<li>Email: <a href="mailto:${this.esc(c.contactEmail)}">${this.esc(c.contactEmail)}</a></li>` : ''}${c.contactPhone ? `<li>Phone: ${this.esc(c.contactPhone)}</li>` : ''}${c.website ? `<li>Visit: <a href="${this.esc(c.website)}">${this.esc(c.website)}</a></li>` : ''}</ul></section>`,
    };
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${this.esc(c.companyName)}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; line-height: 1.6; }
nav { background: #0f766e; color: #fff; display: flex; gap: 1.5rem; padding: 1rem 1.5rem; align-items: center; }
nav .brand { font-weight: 700; }
nav a { color: #fff; text-decoration: none; opacity: .85; }
nav a.active { opacity: 1; border-bottom: 2px solid #fff; }
main { max-width: 820px; margin: 0 auto; padding: 2rem 1.5rem; }
h1, h2 { color: #0f766e; }
h1 { margin-bottom: .25rem; }
.tagline { color: #6b7280; margin-bottom: 1.5rem; }
section { margin-bottom: 1.5rem; }
.card { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: .5rem; padding: 1rem 1.25rem; }
.contact li { margin: .35rem 0; }
footer { text-align: center; padding: 1.5rem; color: #6b7280; font-size: .85rem; }
</style>
</head>
<body>
<nav>
  <span class="brand">${this.esc(c.companyName)}</span>
  ${nav('index', 'Home')}
  ${nav('about', 'About')}
  ${nav('services', 'Services')}
  ${nav('contact', 'Contact')}
</nav>
<main>
  <h1>${this.esc(c.companyName)}</h1>
  <p class="tagline">${this.esc(tagline)}</p>
  ${body[active]}
</main>
<footer>&copy; ${new Date().getFullYear()} ${this.esc(c.companyName)}</footer>
</body>
</html>`;
  }

  private esc(value: string): string {
    return value.replace(/[&<>"']/g, (ch) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return map[ch];
    });
  }
}
