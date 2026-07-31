import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ProposalCaseData } from '@dias/contracts';
import { BuiltSite, SiteSpec } from '../domain/types';
import { SiteRenderer } from '../application/ports';
import { Theme, selectTheme, selectThemeById } from './themes';
import { getIndustryContent, pickTagline, IndustryContent, Feature } from './industry-content';

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
    const theme = spec.theme ? selectThemeById(spec.theme) ?? selectTheme(c.industry, c.companyName) : selectTheme(c.industry, c.companyName);
    const content = getIndustryContent(c.industry);
    const industry = c.industry ?? 'professional';
    const region = c.region ?? 'your area';
    const tagline = pickTagline(content, c.id, industry, region);

    if (spec.tier === 'complex') {
      this.writePage(outDir, 'index.html', this.homePage(c, theme, content, tagline, industry, region));
      this.writePage(outDir, 'about.html', this.aboutPage(c, theme, content, tagline, industry, region));
      this.writePage(outDir, 'services.html', this.servicesPage(c, theme, content, tagline, industry, region));
      this.writePage(outDir, 'testimonials.html', this.testimonialsPage(c, theme, content, tagline, industry, region));
      this.writePage(outDir, 'contact.html', this.contactPage(c, theme, content, tagline, industry, region));
    } else {
      this.writePage(outDir, 'index.html', this.singlePage(c, theme, content, tagline, industry, region));
    }

    return {
      caseId: spec.caseId,
      tier: spec.tier,
      outputPath: outDir,
      previewUrl: `${this.options.previewBaseUrl}/${spec.caseId}/index.html`,
      fileUrl: pathToFileURL(join(outDir, 'index.html')).href,
    };
  }

  private writePage(dir: string, name: string, content: string): void {
    writeFileSync(join(dir, name), content, 'utf8');
  }

  /* ------------------------------------------------------------------ */
  /* Layout shell                                                       */
  /* ------------------------------------------------------------------ */

  private layout(
    c: ProposalCaseData,
    theme: Theme,
    active: string,
    body: string,
    tagline: string,
    region: string,
  ): string {
    const p = theme.palette;
    const navLinks: Array<[string, string, string]> = [
      ['index.html', 'Home', 'Home'],
      ['about.html', 'About', 'About'],
      ['services.html', 'Services', 'Services'],
      ['testimonials.html', 'Testimonials', 'Testimonials'],
      ['contact.html', 'Contact', 'Contact'],
    ];

    const nav = navLinks
      .map(
        ([href, key, label]) =>
          `<a href="${href}"${active === key ? ' class="active"' : ''}>${label}</a>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${this.esc(c.companyName)} — ${this.esc(theme.name)}</title>
<style>
${this.css(theme)}
</style>
</head>
<body>
<header class="site-header">
  <a class="brand" href="index.html"><span class="brand-mark">${this.esc(this.initials(c))}</span><span>${this.esc(c.companyName)}</span></a>
  <nav class="site-nav">${nav}</nav>
</header>
<main>
${body}
</main>
<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <strong>${this.esc(c.companyName)}</strong>
      <p>${this.esc(tagline)}</p>
    </div>
    <div class="footer-contact">
      ${c.contactEmail ? `<span><a href="mailto:${this.esc(c.contactEmail)}">${this.esc(c.contactEmail)}</a></span>` : ''}
      ${c.contactPhone ? `<span>${this.esc(c.contactPhone)}</span>` : ''}
      ${c.website ? `<span>${this.esc(c.website)}</span>` : ''}
    </div>
  </div>
  <div class="footer-bottom">&copy; ${new Date().getFullYear()} ${this.esc(c.companyName)} · ${this.esc(region)}</div>
</footer>
</body>
</html>`;
  }

  private css(theme: Theme): string {
    const p = theme.palette;
    const radius = theme.radius;
    return `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: ${theme.font}; color: ${p.text}; background: ${p.bg}; line-height: 1.7; }
img, svg { max-width: 100%; }
h1, h2, h3, h4 { font-family: ${theme.headingFont}; line-height: 1.2; }

/* Header */
.site-header {
  position: sticky; top: 0; z-index: 20;
  background: ${p.header}; color: ${p.headerText};
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: .9rem clamp(1rem, 4vw, 3rem);
  box-shadow: 0 1px 8px rgba(0,0,0,.12);
}
.brand { display: flex; align-items: center; gap: .6rem; font-weight: 800; font-size: 1.05rem; color: ${p.headerText}; text-decoration: none; }
.brand-mark {
  width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
  background: ${p.accent}; color: ${p.header}; font-size: .8rem; font-weight: 800;
}
.site-nav { display: flex; gap: .25rem; flex-wrap: wrap; }
.site-nav a {
  color: ${p.headerText}; opacity: .82; text-decoration: none;
  font-size: .85rem; font-weight: 600; padding: .4rem .7rem; border-radius: 8px;
  transition: opacity .12s, background .12s;
}
.site-nav a:hover { opacity: 1; background: rgba(255,255,255,.12); }
.site-nav a.active { opacity: 1; background: rgba(255,255,255,.18); }

/* Sections */
.section { padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 4vw, 3rem); }
.section-alt { background: ${p.surface}; }
.section-soft { background: ${p.surfaceAlt}; }
.container { max-width: 1100px; margin: 0 auto; }
.section-head { text-align: center; max-width: 640px; margin: 0 auto 2.5rem; }
.section-head .eyebrow { color: ${p.primary}; font-weight: 700; font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; }
.section-head h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin: .4rem 0 .6rem; color: ${p.text}; }
.section-head p { color: ${p.muted}; }

/* Hero */
.hero { padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem); color: ${p.text}; }
.hero .container { display: grid; gap: 2rem; align-items: center; }
.hero-grid { grid-template-columns: 1.2fr .8fr; }
.hero-split .hero-side { order: 2; }
@media (max-width: 820px) { .hero-grid { grid-template-columns: 1fr; } .hero-split .hero-side { order: 0; } }
.hero.gradient { background: linear-gradient(135deg, ${p.primaryDark}, ${p.primary}); color: #fff; }
.hero.gradient h1 { color: #fff; }
.hero.gradient .muted { color: rgba(255,255,255,.85); }
.hero.dark { background: ${p.header}; color: ${p.headerText}; }
.hero.dark h1 { color: ${p.headerText}; }
.hero.dark .muted { color: rgba(255,255,255,.8); }
.hero.minimal { background: ${p.bg}; text-align: center; }
.hero.minimal .container { max-width: 760px; }
.hero h1 { font-size: clamp(2rem, 5vw, 3.2rem); margin: .6rem 0 1rem; }
.hero .tagline { font-size: 1.1rem; color: ${p.muted}; max-width: 540px; }
.hero.gradient .tagline, .hero.dark .tagline { color: rgba(255,255,255,.85); }
.hero.minimal .tagline { margin: 0 auto; }
.hero-side { display: flex; justify-content: center; }
.hero-card {
  background: rgba(255,255,255,.95); color: ${p.text}; border-radius: ${radius};
  padding: 1.4rem; width: 100%; max-width: 340px;
  box-shadow: 0 18px 40px rgba(0,0,0,.18); border: 1px solid rgba(255,255,255,.4);
}
.hero-card h3 { color: ${p.primary}; margin-bottom: .8rem; }
.hero-card ul { list-style: none; }
.hero-card li { display: flex; gap: .55rem; align-items: flex-start; padding: .45rem 0; font-size: .9rem; }
.hero-card svg { color: ${p.accent}; flex-shrink: 0; margin-top: .15rem; }
.hero-card .hours { border-top: 1px solid ${p.border}; margin-top: .8rem; padding-top: .8rem; font-size: .85rem; color: ${p.muted}; }

/* Buttons */
.btn {
  display: inline-block; padding: .7rem 1.5rem; border-radius: 10px; text-decoration: none;
  font-weight: 700; font-size: .92rem; transition: transform .12s, box-shadow .12s;
}
.btn.solid { background: ${p.accent}; color: ${p.header}; box-shadow: 0 6px 16px rgba(0,0,0,.15); }
.btn.solid:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,0,0,.2); }
.btn.outline { border: 2px solid ${p.primary}; color: ${p.primary}; }
.btn.outline:hover { background: ${p.primary}; color: ${p.bg}; }
.btn.hero-solid { background: ${p.header === '#ffffff' ? p.primary : '#fff'}; color: ${p.header === '#ffffff' ? p.bg : p.header}; }
.btn.hero-outline { border: 2px solid ${p.header === '#ffffff' ? p.primary : '#fff'}; color: ${p.header === '#ffffff' ? p.primary : '#fff'}; }
.cta-buttons { display: flex; gap: .8rem; margin-top: 1.6rem; flex-wrap: wrap; }

/* Feature grid */
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; }
.feature-card {
  background: ${p.bg}; border: 1px solid ${p.border}; border-radius: ${radius};
  padding: 1.4rem; transition: transform .15s, box-shadow .15s;
}
.feature-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,.08); }
.feature-icon {
  width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
  background: ${p.surface}; color: ${p.primary}; margin-bottom: .9rem;
}
.feature-card h3 { font-size: 1rem; margin-bottom: .4rem; }
.feature-card p { font-size: .88rem; color: ${p.muted}; }

/* Services list */
.services-list { display: grid; gap: .7rem; max-width: 720px; margin: 0 auto; }
.service-item {
  display: flex; align-items: center; gap: .9rem; background: ${p.bg};
  border: 1px solid ${p.border}; border-radius: 12px; padding: 1rem 1.2rem;
}
.service-item svg { color: ${p.primary}; flex-shrink: 0; }
.service-item span { font-weight: 600; }
.service-item .arrow { margin-left: auto; color: ${p.muted}; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; text-align: center; }
.stat .value { font-size: 2rem; font-weight: 800; color: ${p.primary}; }
.stat .label { color: ${p.muted}; font-size: .85rem; }

/* Testimonials */
.quote-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.2rem; }
.quote-card { background: ${p.bg}; border: 1px solid ${p.border}; border-radius: ${radius}; padding: 1.4rem; }
.quote-card .stars { color: ${p.accent}; letter-spacing: 2px; margin-bottom: .6rem; }
.quote-card p { font-style: italic; color: ${p.text}; }
.quote-card .who { margin-top: .9rem; font-weight: 700; font-size: .85rem; color: ${p.primary}; }

/* About */
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center; }
@media (max-width: 820px) { .about-grid { grid-template-columns: 1fr; } }
.about-card { background: ${p.surface}; border-radius: ${radius}; padding: 1.6rem; border: 1px solid ${p.border}; }
.about-card h3 { color: ${p.primary}; margin-bottom: .6rem; }

/* Contact */
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 820px) { .contact-grid { grid-template-columns: 1fr; } }
.contact-list { list-style: none; display: grid; gap: .8rem; }
.contact-list li { display: flex; gap: .7rem; align-items: center; }
.contact-list svg { color: ${p.primary}; flex-shrink: 0; }
.contact-list a { color: ${p.text}; text-decoration: none; }
.contact-list a:hover { text-decoration: underline; }
.contact-card { background: ${p.surface}; border: 1px solid ${p.border}; border-radius: ${radius}; padding: 1.5rem; }
.contact-card h3 { color: ${p.primary}; margin-bottom: .8rem; }

/* CTA band */
.cta-band { background: linear-gradient(135deg, ${p.primary}, ${p.accent}); color: ${p.header}; text-align: center; padding: clamp(2.5rem, 6vw, 4rem) 1rem; }
.cta-band h2 { font-size: clamp(1.5rem, 3.5vw, 2.2rem); margin-bottom: .6rem; }
.cta-band p { opacity: .9; margin-bottom: 1.4rem; }
.cta-band .btn { background: ${p.bg}; color: ${p.primary}; }

/* Footer */
.site-footer { background: ${p.header}; color: ${p.headerText}; padding-top: 2.5rem; }
.footer-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; padding: 0 1rem 2rem; }
@media (max-width: 700px) { .footer-inner { grid-template-columns: 1fr; } }
.footer-inner strong { font-size: 1.05rem; }
.footer-inner p { opacity: .75; font-size: .88rem; margin-top: .4rem; }
.footer-contact { display: grid; gap: .4rem; font-size: .85rem; }
.footer-contact a { color: ${p.headerText}; opacity: .9; }
.footer-contact a:hover { opacity: 1; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,.15); text-align: center; padding: 1rem; font-size: .8rem; opacity: .7; }
${this.extraCss(theme)}
`;
  }

  private extraCss(theme: Theme): string {
    if (theme.heroStyle === 'split') {
      return `
.hero { background: linear-gradient(180deg, ${theme.palette.surface}, ${theme.palette.bg}); }
.hero h1 { color: ${theme.palette.text}; }
.hero .tagline { color: ${theme.palette.muted}; }
`;
    }
    return '';
  }

  private svg(iconPath: string, size = 20): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${iconPath}"/></svg>`;
  }

  private initials(c: ProposalCaseData): string {
    return c.companyName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  /* ------------------------------------------------------------------ */
  /* Sections                                                           */
  /* ------------------------------------------------------------------ */

  private heroSection(
    c: ProposalCaseData,
    theme: Theme,
    content: IndustryContent,
    tagline: string,
  ): string {
    const p = theme.palette;
    const heroClass =
      theme.heroStyle === 'dark'
        ? 'hero dark'
        : theme.heroStyle === 'minimal'
          ? 'hero minimal'
          : theme.heroStyle === 'gradient'
            ? 'hero gradient'
            : 'hero hero-split';

    const primaryBtn =
      theme.heroStyle === 'minimal'
        ? '<a class="btn hero-solid" href="services.html">Explore services</a>'
        : '<a class="btn hero-solid" href="services.html">Explore services</a>';
    const secondaryBtn = `<a class="btn hero-outline" href="contact.html">Get in touch</a>`;

    const sideCard = `
      <div class="hero-side">
        <div class="hero-card">
          <h3>Why choose ${this.esc(c.companyName)}</h3>
          <ul>
            ${content.features
              .slice(0, 3)
              .map(
                (f) =>
                  `<li>${this.svg(f.icon, 18)}<span>${this.esc(f.title)}</span></li>`,
              )
              .join('')}
          </ul>
          <div class="hours">${this.esc(content.hours)}</div>
        </div>
      </div>`;

    return `
<section class="${heroClass}">
  <div class="container ${theme.heroStyle === 'split' ? 'hero-grid' : ''}">
    <div>
      <span class="eyebrow" style="color:${p.accent};font-weight:700;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase">${this.esc(c.industry ?? 'Welcome')}</span>
      <h1>${this.esc(c.companyName)}</h1>
      <p class="tagline">${this.esc(tagline)}</p>
      <div class="cta-buttons">${primaryBtn} ${secondaryBtn}</div>
    </div>
    ${theme.heroStyle === 'gradient' || theme.heroStyle === 'split' ? sideCard : ''}
  </div>
</section>`;
  }

  private statsSection(content: IndustryContent): string {
    return `
<section class="section section-alt">
  <div class="container stats-grid">
    ${content.stats
      .map((s) => `<div class="stat"><div class="value">${this.esc(s.value)}</div><div class="label">${this.esc(s.label)}</div></div>`)
      .join('')}
  </div>
</section>`;
  }

  private featuresSection(content: IndustryContent): string {
    return `
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">What we do</span>
      <h2>Why customers choose us</h2>
      <p>Everything we do is built around delivering a great experience.</p>
    </div>
    <div class="feature-grid">
      ${content.features
        .map(
          (f) => `
      <div class="feature-card">
        <div class="feature-icon">${this.svg(f.icon, 22)}</div>
        <h3>${this.esc(f.title)}</h3>
        <p>${this.esc(f.description)}</p>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
  }

  private servicesSection(content: IndustryContent): string {
    return `
<section class="section section-soft">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Our services</span>
      <h2>Everything you need</h2>
      <p>A complete range of services, tailored to you.</p>
    </div>
    <div class="services-list">
      ${content.services
        .map(
          (s) => `
      <div class="service-item">
        ${this.svg('M12 4v16M4 12h16', 20)}
        <span>${this.esc(s)}</span>
        <span class="arrow">→</span>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
  }

  private testimonialsSection(content: IndustryContent): string {
    const quotes = [
      [content.testimonial, 'Local customer'],
      [
        `We have worked with ${'X'} for years and the quality never dips. Highly recommended to anyone in the area.`,
        'Repeat client',
      ],
      [
        'Professional, responsive and genuinely invested in doing a great job. Five stars.',
        'Verified review',
      ],
    ];
    return `
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Testimonials</span>
      <h2>What people say</h2>
    </div>
    <div class="quote-grid">
      ${quotes
        .map(
          ([q, who]) => `
      <div class="quote-card">
        <div class="stars">★★★★★</div>
        <p>“${this.esc(q)}”</p>
        <div class="who">${this.esc(who)}</div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
  }

  private aboutSection(
    c: ProposalCaseData,
    content: IndustryContent,
    industry: string,
    region: string,
  ): string {
    const aboutText = content.about.replace('{company}', c.companyName).replace('{industry}', industry).replace('{region}', region);
    return `
<section class="section section-alt">
  <div class="container about-grid">
    <div>
      <div class="section-head" style="text-align:left;margin:0 0 1rem">
        <span class="eyebrow">About us</span>
        <h2>Local, dedicated, dependable</h2>
      </div>
      <p style="color:#64748b">${this.esc(aboutText)}</p>
      <p style="color:#64748b;margin-top:1rem">${this.esc(content.hours)}</p>
    </div>
    <div class="about-card">
      <h3>Why we started</h3>
      <p style="font-size:.9rem;color:#64748b">${this.esc(c.companyName)} was founded with a simple goal: bring genuine, high-quality ${this.esc(industry)} service to ${this.esc(region)}. That promise still guides every decision we make today.</p>
    </div>
  </div>
</section>`;
  }

  private contactSection(c: ProposalCaseData, content: IndustryContent): string {
    return `
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Contact</span>
      <h2>Get in touch</h2>
      <p>We would love to hear from you.</p>
    </div>
    <div class="contact-grid">
      <div class="contact-card">
        <h3>Contact details</h3>
        <ul class="contact-list">
          ${c.contactEmail ? `<li>${this.svg('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v1l8 5 8-5V6l-8 5-8-5z', 20)}<a href="mailto:${this.esc(c.contactEmail)}">${this.esc(c.contactEmail)}</a></li>` : ''}
          ${c.contactPhone ? `<li>${this.svg('M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8z', 20)}<span>${this.esc(c.contactPhone)}</span></li>` : ''}
          ${c.website ? `<li>${this.svg('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9H17a16 16 0 0 0-1.4-5.3A8 8 0 0 1 19.9 11zM12 4c1 1.2 1.9 2.7 2.3 5H9.7C10.1 6.7 11 5.2 12 4zM4.3 13H7a16 16 0 0 0 1.4 5.3A8 8 0 0 1 4.3 13zm0-2a8 8 0 0 1 4.1-4.3A16 16 0 0 0 7 11H4.3zM12 20c-1-1.2-1.9-2.7-2.3-5h4.6c-.4 2.3-1.3 3.8-2.3 5zm2.6-7H9.4A14 14 0 0 0 9.7 12c0-.7.1-1.4.3-2h4c.2.6.3 1.3.3 2 0 .7-.1 1.4-.3 2zm.3 5.3A16 16 0 0 0 17 11h2.7a8 8 0 0 1-4.8 7.3z', 20)}<a href="${this.esc(c.website)}" target="_blank" rel="noopener">${this.esc(c.website)}</a></li>` : ''}
          <li>${this.svg('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm1-15h-2v6l5 3 .9-1.6L13 12.5z', 20)}<span>${this.esc(content.hours)}</span></li>
        </ul>
      </div>
      <div class="about-card">
        <h3>Quick enquiry</h3>
        <p style="font-size:.9rem;color:#64748b">Prefer email? Send us a message and we will get back to you within one business day.</p>
        <p style="font-size:.9rem;color:#64748b;margin-top:1rem">${this.esc(c.companyName)} · ${this.esc(c.region ?? '')}</p>
      </div>
    </div>
  </div>
</section>`;
  }

  private ctaBand(c: ProposalCaseData, industry: string, region: string): string {
    return `
<section class="cta-band">
  <div class="container">
    <h2>Ready to work with ${this.esc(c.companyName)}?</h2>
    <p>Discover why ${this.esc(region)} trusts us for ${this.esc(industry)} services.</p>
    <a class="btn" href="contact.html">Contact us today</a>
  </div>
</section>`;
  }

  /* ------------------------------------------------------------------ */
  /* Pages                                                              */
  /* ------------------------------------------------------------------ */

  private singlePage(
    c: ProposalCaseData,
    theme: Theme,
    content: IndustryContent,
    tagline: string,
    industry: string,
    region: string,
  ): string {
    const body = `
${this.heroSection(c, theme, content, tagline)}
${this.statsSection(content)}
${this.aboutSection(c, content, industry, region)}
${this.featuresSection(content)}
${this.servicesSection(content)}
${this.testimonialsSection(content)}
${this.contactSection(c, content)}
${this.ctaBand(c, industry, region)}
`;
    return this.layout(c, theme, 'Home', body, tagline, region);
  }

  private homePage(
    c: ProposalCaseData,
    theme: Theme,
    content: IndustryContent,
    tagline: string,
    industry: string,
    region: string,
  ): string {
    const body = `
${this.heroSection(c, theme, content, tagline)}
${this.statsSection(content)}
${this.featuresSection(content)}
${this.testimonialsSection(content)}
${this.ctaBand(c, industry, region)}
`;
    return this.layout(c, theme, 'Home', body, tagline, region);
  }

  private aboutPage(
    c: ProposalCaseData,
    theme: Theme,
    content: IndustryContent,
    tagline: string,
    industry: string,
    region: string,
  ): string {
    const body = `
${this.pageHeader(c, tagline, 'About us')}
${this.aboutSection(c, content, industry, region)}
${this.featuresSection(content)}
`;
    return this.layout(c, theme, 'About', body, tagline, region);
  }

  private servicesPage(
    c: ProposalCaseData,
    theme: Theme,
    content: IndustryContent,
    tagline: string,
    industry: string,
    region: string,
  ): string {
    const body = `
${this.pageHeader(c, tagline, 'Our services')}
${this.servicesSection(content)}
${this.featuresSection(content)}
${this.ctaBand(c, industry, region)}
`;
    return this.layout(c, theme, 'Services', body, tagline, region);
  }

  private testimonialsPage(
    c: ProposalCaseData,
    theme: Theme,
    content: IndustryContent,
    tagline: string,
    industry: string,
    region: string,
  ): string {
    const body = `
${this.pageHeader(c, tagline, 'Testimonials')}
${this.testimonialsSection(content)}
${this.statsSection(content)}
${this.ctaBand(c, industry, region)}
`;
    return this.layout(c, theme, 'Testimonials', body, tagline, region);
  }

  private contactPage(
    c: ProposalCaseData,
    theme: Theme,
    content: IndustryContent,
    tagline: string,
    industry: string,
    region: string,
  ): string {
    const body = `
${this.pageHeader(c, tagline, 'Contact us')}
${this.contactSection(c, content)}
${this.ctaBand(c, industry, region)}
`;
    return this.layout(c, theme, 'Contact', body, tagline, region);
  }

  private pageHeader(c: ProposalCaseData, tagline: string, title: string): string {
    return `
<section class="section section-alt" style="padding-bottom:0">
  <div class="container section-head" style="margin-bottom:1.5rem">
    <span class="eyebrow">${this.esc(c.companyName)}</span>
    <h2>${this.esc(title)}</h2>
    <p>${this.esc(tagline)}</p>
  </div>
</section>`;
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
