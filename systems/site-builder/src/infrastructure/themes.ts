export interface Theme {
  id: string;
  name: string;
  palette: {
    primary: string;
    primaryDark: string;
    accent: string;
    bg: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    muted: string;
    border: string;
    header: string;
    headerText: string;
  };
  font: string;
  headingFont: string;
  radius: string;
  heroStyle: 'gradient' | 'split' | 'minimal' | 'dark';
  buttonStyle: 'solid' | 'outline';
}

export const THEMES: Theme[] = [
  {
    id: 'modern-teal',
    name: 'Modern Teal',
    palette: {
      primary: '#0d9488',
      primaryDark: '#115e59',
      accent: '#2dd4bf',
      bg: '#ffffff',
      surface: '#f0fdfa',
      surfaceAlt: '#f8fafc',
      text: '#0f172a',
      muted: '#64748b',
      border: '#ccfbf1',
      header: '#0f766e',
      headerText: '#ffffff',
    },
    font: "'Segoe UI', system-ui, sans-serif",
    headingFont: "'Segoe UI', system-ui, sans-serif",
    radius: '14px',
    heroStyle: 'gradient',
    buttonStyle: 'solid',
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    palette: {
      primary: '#c2410c',
      primaryDark: '#7c2d12',
      accent: '#f59e0b',
      bg: '#fdfaf7',
      surface: '#fff7ed',
      surfaceAlt: '#fef3c7',
      text: '#431407',
      muted: '#9a8572',
      border: '#fed7aa',
      header: '#9a3412',
      headerText: '#fff7ed',
    },
    font: "'Georgia', 'Times New Roman', serif",
    headingFont: "'Georgia', 'Times New Roman', serif",
    radius: '10px',
    heroStyle: 'split',
    buttonStyle: 'solid',
  },
  {
    id: 'deep-navy',
    name: 'Deep Navy',
    palette: {
      primary: '#1e3a8a',
      primaryDark: '#172554',
      accent: '#f59e0b',
      bg: '#ffffff',
      surface: '#eff6ff',
      surfaceAlt: '#f8fafc',
      text: '#0f172a',
      muted: '#64748b',
      border: '#dbeafe',
      header: '#0f172a',
      headerText: '#f8fafc',
    },
    font: "'Segoe UI', system-ui, sans-serif",
    headingFont: "'Segoe UI', system-ui, sans-serif",
    radius: '6px',
    heroStyle: 'dark',
    buttonStyle: 'solid',
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    palette: {
      primary: '#16a34a',
      primaryDark: '#14532d',
      accent: '#84cc16',
      bg: '#fcfefd',
      surface: '#f0fdf4',
      surfaceAlt: '#ecfdf5',
      text: '#052e16',
      muted: '#6b7280',
      border: '#bbf7d0',
      header: '#166534',
      headerText: '#ffffff',
    },
    font: "'Segoe UI', system-ui, sans-serif",
    headingFont: "'Segoe UI', system-ui, sans-serif",
    radius: '12px',
    heroStyle: 'gradient',
    buttonStyle: 'solid',
  },
  {
    id: 'playful-violet',
    name: 'Playful Violet',
    palette: {
      primary: '#7c3aed',
      primaryDark: '#5b21b6',
      accent: '#ec4899',
      bg: '#ffffff',
      surface: '#f5f3ff',
      surfaceAlt: '#fdf4ff',
      text: '#2e1065',
      muted: '#8b7fa8',
      border: '#ede9fe',
      header: '#4c1d95',
      headerText: '#ffffff',
    },
    font: "'Segoe UI', system-ui, sans-serif",
    headingFont: "'Segoe UI', system-ui, sans-serif",
    radius: '18px',
    heroStyle: 'split',
    buttonStyle: 'solid',
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    palette: {
      primary: '#0f172a',
      primaryDark: '#000000',
      accent: '#ef4444',
      bg: '#ffffff',
      surface: '#f8fafc',
      surfaceAlt: '#ffffff',
      text: '#111827',
      muted: '#6b7280',
      border: '#e5e7eb',
      header: '#ffffff',
      headerText: '#111827',
    },
    font: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingFont: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    radius: '4px',
    heroStyle: 'minimal',
    buttonStyle: 'outline',
  },
];

const INDUSTRY_THEME: Record<string, string> = {
  restaurants: 'warm-terracotta',
  food: 'warm-terracotta',
  bakeries: 'warm-terracotta',
  healthcare: 'fresh-green',
  medical: 'fresh-green',
  automotive: 'deep-navy',
  retail: 'playful-violet',
  printing: 'clean-minimal',
  technology: 'modern-teal',
  professional: 'deep-navy',
};

export function selectTheme(industry?: string, companyName?: string): Theme {
  const fromIndustry = industry?.toLowerCase();
  if (fromIndustry && INDUSTRY_THEME[fromIndustry]) {
    return THEMES.find((t) => t.id === INDUSTRY_THEME[fromIndustry])!;
  }
  const hash = [...(companyName ?? '')].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return THEMES[hash % THEMES.length];
}

export function selectThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

export function listThemes(): Array<{ id: string; name: string }> {
  return THEMES.map((t) => ({ id: t.id, name: t.name }));
}
