export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface IndustryContent {
  services: string[];
  features: Feature[];
  taglines: string[];
  stats: Array<{ value: string; label: string }>;
  hours: string;
  about: string;
  testimonial: string;
}

const ICONS = {
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  heart:
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  shield:
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm1-15h-2v6l5 3 .9-1.6L13 12.5z',
  leaf:
    'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z',
  truck:
    'M3 6h13v8H3z M16 10h4l3 3v3h-7 M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  spark:
    'M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z',
  users:
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  coffee:
    'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zm4-2a2 2 0 0 1 2-2 2 2 0 0 1 2-2',
  tools:
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  home:
    'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
};

const GENERIC: IndustryContent = {
  services: [
    'Consulting & advisory',
    'Project planning',
    'Quality execution',
    'After-care support',
  ],
  features: [
    {
      title: 'Experienced team',
      description: 'A dedicated team with years of hands-on experience in the field.',
      icon: ICONS.users,
    },
    {
      title: 'Reliable service',
      description: 'We deliver on time, every time, with transparent communication.',
      icon: ICONS.shield,
    },
    {
      title: 'Local expertise',
      description: 'We know the local market and tailor everything to your needs.',
      icon: ICONS.star,
    },
    {
      title: 'Customer first',
      description: 'Your satisfaction drives everything we do, from first contact to finish.',
      icon: ICONS.heart,
    },
  ],
  taglines: [
    'Trusted {industry} services in {region}',
    'Quality {industry} care for the local community',
    'Your partner for {industry} excellence in {region}',
  ],
  stats: [
    { value: '10+', label: 'Years of experience' },
    { value: '500+', label: 'Happy customers' },
    { value: '100%', label: 'Satisfaction rate' },
  ],
  hours: 'Mon – Sat: 9:00 – 19:00',
  about:
    'At {company}, we combine experience, care and attention to detail to deliver outstanding {industry} services across {region}. Our team is committed to making every project a success.',
  testimonial:
    'Working with {company} was a pleasure from start to finish. Professional, friendly and incredibly reliable.',
};

const INDUSTRY_CONTENT: Record<string, IndustryContent> = {
  restaurants: {
    services: ['Daily lunch & dinner menu', 'Event catering', 'Private dining', 'Takeaway & delivery'],
    features: [
      { title: 'Fresh ingredients', description: 'Sourced daily from local producers for maximum flavour.', icon: ICONS.leaf },
      { title: 'Chef-crafted menu', description: 'A seasonal menu that changes with the best of each market.', icon: ICONS.coffee },
      { title: 'Cozy atmosphere', description: 'A warm space designed for great conversations and great food.', icon: ICONS.heart },
      { title: 'Fast & friendly', description: 'Attentive service from the moment you walk in.', icon: ICONS.star },
    ],
    taglines: [
      'Authentic flavours in the heart of {region}',
      'A taste of the local food scene, done right',
      'Good food, great company in {region}',
    ],
    stats: [
      { value: '120+', label: 'Dishes on the menu' },
      { value: '4.8', label: 'Average rating' },
      { value: '15k+', label: 'Guests served' },
    ],
    hours: 'Tue – Sun: 12:00 – 15:00 & 19:00 – 23:00',
    about:
      'At {company}, every plate tells a story. We serve fresh, seasonal {industry} dishes made with locally sourced ingredients, in a space where friends, family and food come together.',
    testimonial:
      'The best {industry} in {region}, hands down. Fresh food, lovely staff and a menu that surprises every time.',
  },
  bakeries: {
    services: ['Fresh bread daily', 'Custom celebration cakes', 'Pastries & confectionery', 'Café seating'],
    features: [
      { title: 'Baked at dawn', description: 'Every loaf is baked fresh each morning, never frozen.', icon: ICONS.coffee },
      { title: 'Artisan recipes', description: 'Traditional methods and honest ingredients, nothing artificial.', icon: ICONS.heart },
      { title: 'Made to order', description: 'Custom cakes for weddings, birthdays and corporate events.', icon: ICONS.spark },
      { title: 'Allergen-friendly', description: 'Gluten-free and vegan options available every day.', icon: ICONS.leaf },
    ],
    taglines: [
      'Fresh from the oven, every single morning',
      'Artisan bakes made with love in {region}',
      'The neighbourhood bakery you can trust',
    ],
    stats: [
      { value: '25+', label: 'Daily specials' },
      { value: '5am', label: 'First bake of the day' },
      { value: '40+', label: 'Years in the community' },
    ],
    hours: 'Mon – Sun: 7:00 – 20:00',
    about:
      '{company} has been filling {region} kitchens with the smell of fresh bread for decades. We bake in small batches, by hand, using time-honoured recipes and the best flours available.',
    testimonial:
      'Their sourdough is legendary around here. You simply have not had bread until you have tried {company}.',
  },
  healthcare: {
    services: ['General check-ups', 'Specialist consultations', 'Preventive care', 'Home visits'],
    features: [
      { title: 'Caring professionals', description: 'A compassionate team that listens before it treats.', icon: ICONS.heart },
      { title: 'Modern facilities', description: 'Clean, comfortable and equipped with modern technology.', icon: ICONS.shield },
      { title: 'Flexible scheduling', description: 'Same-week appointments and short waiting times.', icon: ICONS.clock },
      { title: 'Whole-person care', description: 'Prevention first, with clear guidance at every step.', icon: ICONS.users },
    ],
    taglines: [
      'Your health, in caring hands',
      'Modern healthcare, close to home in {region}',
      'Caring for our community, one patient at a time',
    ],
    stats: [
      { value: '8k+', label: 'Patients cared for' },
      { value: '15+', label: 'Specialists on staff' },
      { value: '98%', label: 'Patient satisfaction' },
    ],
    hours: 'Mon – Fri: 8:00 – 20:00, Sat: 9:00 – 13:00',
    about:
      '{company} is a {region} healthcare practice built around one idea: care that is personal, accessible and honest. From routine check-ups to specialist care, we are here for you.',
    testimonial:
      'The team at {company} genuinely cares. They explained everything, never rushed us, and followed up personally.',
  },
  automotive: {
    services: ['Full service & maintenance', 'Diagnostics & repairs', 'Tyre & brake care', 'Pre-purchase inspection'],
    features: [
      { title: 'Certified mechanics', description: 'Factory-trained technicians using modern diagnostic tools.', icon: ICONS.tools },
      { title: 'Transparent pricing', description: 'Clear quotes before any work begins — no surprises.', icon: ICONS.shield },
      { title: 'Genuine parts', description: 'Quality parts backed by warranty on every repair.', icon: ICONS.star },
      { title: 'Fast turnaround', description: 'Most services completed the same day.', icon: ICONS.clock },
    ],
    taglines: [
      'Keep your car running like new',
      'Expert care for every make and model in {region}',
      'Your trusted local garage',
    ],
    stats: [
      { value: '20y+', label: 'Combined experience' },
      { value: '9k+', label: 'Vehicles serviced' },
      { value: '3yr', label: 'Parts warranty' },
    ],
    hours: 'Mon – Sat: 8:00 – 18:00',
    about:
      '{company} has kept {region} drivers on the road for over two decades. Honest advice, quality parts and workmanship we stand behind — that is the standard here.',
    testimonial:
      'Finally a garage that tells you the truth. Fair prices, quick work and they even washed the car.',
  },
  retail: {
    services: ['Curated collections', 'Personal styling advice', 'Gift wrapping', 'Click & collect'],
    features: [
      { title: 'Curated selection', description: 'Hand-picked products you will not find everywhere.', icon: ICONS.spark },
      { title: 'Personal service', description: 'Friendly staff who genuinely help, never pressure.', icon: ICONS.heart },
      { title: 'Local & unique', description: 'Supporting local makers and independent brands.', icon: ICONS.star },
      { title: 'Easy returns', description: 'Simple, no-fuss exchanges and returns.', icon: ICONS.shield },
    ],
    taglines: [
      'Discover something special in {region}',
      'Unique finds, friendly faces',
      'Shop local, love local',
    ],
    stats: [
      { value: '2k+', label: 'Products in store' },
      { value: '50+', label: 'Local brands stocked' },
      { value: '4.9', label: 'Customer rating' },
    ],
    hours: 'Mon – Sat: 10:00 – 19:00',
    about:
      '{company} is more than a shop — it is a place to discover. We curate a collection of unique, quality products and stock {region} local brands you will not find anywhere else.',
    testimonial:
      'My favourite shop in {region}. Every visit is a treasure hunt and the staff are wonderful.',
  },
  printing: {
    services: ['Print & bind', 'Business cards & stationery', 'Large format', 'Design services'],
    features: [
      { title: 'Precision quality', description: 'Crisp, accurate printing on every job, big or small.', icon: ICONS.star },
      { title: 'Fast turnaround', description: 'Most orders ready within 24 hours.', icon: ICONS.clock },
      { title: 'Full service', description: 'Design, print and finish under one roof.', icon: ICONS.tools },
      { title: 'Volume friendly', description: 'Competitive pricing from one copy to thousands.', icon: ICONS.shield },
    ],
    taglines: [
      'Your ideas, beautifully printed',
      'Precision print for every project in {region}',
      'From concept to finished product',
    ],
    stats: [
      { value: '1M+', label: 'Pages printed yearly' },
      { value: '24h', label: 'Express turnaround' },
      { value: '500+', label: 'Business clients' },
    ],
    hours: 'Mon – Fri: 9:00 – 18:00',
    about:
      '{company} has been the go-to print shop in {region} for independent creators and businesses alike. Design, print and finishing — all handled with care and precision.',
    testimonial:
      'They print everything for our studio. Reliable, fast and the colour accuracy is impeccable.',
  },
};

export function getIndustryContent(industry?: string): IndustryContent {
  const key = industry?.toLowerCase();
  return (key && INDUSTRY_CONTENT[key]) || GENERIC;
}

export function pickTagline(content: IndustryContent, seed: string, industry: string, region: string): string {
  const hash = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const template = content.taglines[hash % content.taglines.length];
  return template.replace('{industry}', industry).replace('{region}', region || 'your area');
}
