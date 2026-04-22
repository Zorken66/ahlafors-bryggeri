import { normalizeHeroOverlayOpacity } from "@/lib/hero-overlay";

export type CmsRole = "superadmin" | "editor" | "blog_editor" | "contact_editor";
export type HomepageSectionId = "hero" | "about" | "products" | "news" | "services" | "cta";

export type RullerietEvent = {
  id: string;
  date: string;
  time: string;
  endTime?: string;
  title: string;
  description: string;
  image?: string;
  food?: string;
  location?: string;
  ticketUrl?: string;
  featured?: boolean;
  published?: boolean;
};

export type RullerietPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  publishedAt: string;
  featured: boolean;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type ProductLink = {
  label: string;
  url: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  icon?: string;
};

export type ProductEntry = {
  id: string;
  name: string;
  slug?: string;
  type: string;
  description: string;
  fullDescription: string;
  style: string;
  alcohol: string;
  volume: string;
  systembolaget: string;
  artikelnummer?: string;
  image: string;
  category: string;
  featured: boolean;
  published?: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  links?: ProductLink[];
  ogImage?: string;
  relatedProductIds?: string[];
};

export type SiteContent = {
  site: {
    companyName: string;
    metadataTitle: string;
    metadataDescription: string;
    metadataKeywords: string[];
    canonicalUrl?: string;
    ogImage?: string;
    productCategories?: ProductCategory[];
    featuredProductIds?: string[];
  };
  homepage: {
    sectionOrder: Array<{
      id: HomepageSectionId;
      enabled: boolean;
    }>;
    heroEyebrow: string;
    heroTitle: string;
    heroLead: string;
    heroTagline: string;
    heroBody: string;
    heroBackgroundImage: string;
    heroOverlayOpacity: number;
    heroPrimaryCtaLabel: string;
    heroPrimaryCtaLink: string;
    heroSecondaryCtaLabel: string;
    heroSecondaryCtaLink: string;
    productsTitle: string;
    productsIntro: string;
    productsCtaLabel: string;
    newsTitle: string;
    newsIntro: string;
    newsCtaLabel: string;
    servicesTitle: string;
    servicesIntro: string;
    ctaTitle: string;
    ctaLead: string;
    ctaBody: string;
    ctaPrimaryLabel: string;
    ctaPrimaryLink: string;
    ctaSecondaryLabel: string;
    ctaSecondaryLink: string;
    ctaCards: Array<{
      icon: string;
      title: string;
      lines: string[];
    }>;
  };
  about: {
    homepageHeading: string;
    homepageParagraphs: string[];
    homepageImage: string;
    stats: Array<{ label: string; value: string }>;
    pageHeroTitle: string;
    pageHeroSubtitle: string;
    pageHeroImage: string;
    pageHeroOverlayOpacity: number;
    seoTitle?: string;
    seoDescription?: string;
    historyTitle: string;
    historyParagraphs: string[];
    historyImage: string;
    craftTitle: string;
    craftLead: string;
    ingredients: string[];
    distributionParagraphs: string[];
    locationTitle: string;
    locationLead: string;
    locationSublead: string;
  };
  productsPage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroHighlights: string[];
    heroOverlayOpacity: number;
    seoTitle?: string;
    seoDescription?: string;
    emptyStateText: string;
    ctaTitle: string;
    ctaText: string;
    ctaPrimaryLabel: string;
    ctaPrimaryLink: string;
    ctaSecondaryLabel: string;
    ctaSecondaryLink: string;
  };
  productDetailPage: {
    heroOverlayOpacity: number;
    backLinkLabel: string;
    descriptionHeading: string;
    linksHeading: string;
    linksEmptyText: string;
    linkActionLabel: string;
    dataHeading: string;
    articleNumberLabel: string;
    publishedLabel: string;
    relatedCountLabel: string;
    relatedEyebrow: string;
    relatedTitle: string;
    allProductsLabel: string;
    viewProductLabel: string;
  };
  products: ProductEntry[];
  news: Array<{
    id: string;
    title: string;
    excerpt: string;
    date: string;
    image: string;
    link: string;
    featured: boolean;
    published?: boolean;
    publishedAt?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>;
  services: Array<{
    id: string;
    title: string;
    shortDescription: string;
    description: string;
    details: string[];
    icon: string;
    link: string;
    published?: boolean;
    publishedAt?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>;
  servicesPage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroOverlayOpacity: number;
    seoTitle?: string;
    seoDescription?: string;
    introText: string;
    ctaTitle: string;
    ctaText: string;
    ctaPrimaryLabel: string;
    ctaPrimaryLink: string;
    ctaSecondaryLabel: string;
    ctaSecondaryLink: string;
  };
  recipes: Array<{
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    difficulty: string;
    time: string;
    servings: string;
    pairing: string;
    image: string;
    published?: boolean;
    publishedAt?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>;
  recipesPage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroOverlayOpacity: number;
    seoTitle?: string;
    seoDescription?: string;
    introTitle: string;
    introText: string;
    introSubtext: string;
    ctaTitle: string;
    ctaText: string;
    ctaPrimaryLabel: string;
    ctaPrimaryLink: string;
    ctaSecondaryLabel: string;
    ctaSecondaryLink: string;
  };
  rulleriet: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroOverlayOpacity: number;
    seoTitle?: string;
    seoDescription?: string;
    introTitle: string;
    introParagraphs: string[];
    paymentTitle: string;
    paymentText: string;
    blogTitle: string;
    blogIntro: string;
    blogPosts: RullerietPost[];
    events: RullerietEvent[];
    locationTitle: string;
    locationText: string;
  };
  contact: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heroOverlayOpacity: number;
    seoTitle?: string;
    seoDescription?: string;
    addressTitle: string;
    addressLines: string[];
    locationTitle: string;
    locationDescription: string;
    socialLinks: Array<{ platform: string; url: string }>;
    productsInfoTitle: string;
    productsInfoParagraphs: string[];
    email: string;
    phone: string;
    contactFormSubjectPlaceholder: string;
    mapTitle: string;
    mapSubtitle: string;
    ctaTitle: string;
    ctaText: string;
  };
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRullerietPostArray(value: unknown): value is RullerietPost[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const candidate = item as Partial<RullerietPost>;
    return typeof candidate.id === "string"
      && typeof candidate.title === "string"
      && typeof candidate.slug === "string"
      && typeof candidate.excerpt === "string"
      && typeof candidate.content === "string"
      && typeof candidate.image === "string"
      && typeof candidate.publishedAt === "string"
      && typeof candidate.featured === "boolean"
      && typeof candidate.published === "boolean";
  });
}

function isRullerietEventArray(value: unknown): value is RullerietEvent[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const candidate = item as Partial<RullerietEvent>;
    return typeof candidate.id === "string"
      && typeof candidate.date === "string"
      && typeof candidate.time === "string"
      && typeof candidate.title === "string"
      && typeof candidate.description === "string"
      && (candidate.endTime === undefined || typeof candidate.endTime === "string")
      && (candidate.image === undefined || typeof candidate.image === "string")
      && (candidate.food === undefined || typeof candidate.food === "string")
      && (candidate.location === undefined || typeof candidate.location === "string")
      && (candidate.ticketUrl === undefined || typeof candidate.ticketUrl === "string")
      && (candidate.featured === undefined || typeof candidate.featured === "boolean")
      && (candidate.published === undefined || typeof candidate.published === "boolean");
  });
}

function normalizeRullerietEvents(events: unknown): RullerietEvent[] {
  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((event, index) => {
      const rawTime = typeof event.time === "string" ? event.time.trim() : "";
      const parsedRange = rawTime.includes("-")
        ? rawTime.split("-").map((part) => part.trim()).filter(Boolean)
        : [];
      const normalizedTime = parsedRange.length >= 2 ? parsedRange[0] : rawTime;
      const normalizedEndTime = typeof event.endTime === "string" && event.endTime.trim()
        ? event.endTime.trim()
        : parsedRange.length >= 2
          ? parsedRange[1]
          : undefined;

      return {
        id: typeof event.id === "string" && event.id.trim() ? event.id : `rulleriet-event-${index + 1}-${String(event.date ?? "")}`,
        date: typeof event.date === "string" ? event.date : "",
        time: normalizedTime,
        endTime: normalizedEndTime,
        title: typeof event.title === "string" ? event.title : "",
        description: typeof event.description === "string" ? event.description : "",
        image: typeof event.image === "string" && event.image.trim() ? event.image : undefined,
        food: typeof event.food === "string" && event.food.trim() ? event.food : undefined,
        location: typeof event.location === "string" && event.location.trim() ? event.location : undefined,
        ticketUrl: typeof event.ticketUrl === "string" && event.ticketUrl.trim() ? event.ticketUrl : undefined,
        featured: typeof event.featured === "boolean" ? event.featured : false,
        published: typeof event.published === "boolean" ? event.published : true,
      };
    });
}

export function normalizeSiteContent(content: SiteContent): SiteContent {
  const site = {
    ...content.site,
  };

  const homepage = content.homepage ?? {
    sectionOrder: [
      { id: "hero", enabled: true },
      { id: "about", enabled: true },
      { id: "products", enabled: true },
      { id: "news", enabled: true },
      { id: "services", enabled: true },
      { id: "cta", enabled: true },
    ],
    heroEyebrow: "Sedan 1996",
    heroTitle: "Hantverk i varje droppe",
    heroLead: "Upptäck det unika hantverket bakom varje flaska från Ahlafors Bryggerier",
    heroTagline: "Sedan 1996",
    heroBody: "Mikrobryggeri i det historiska spinneriet från 1850-talet • Alafors, Ale kommun",
    heroBackgroundImage: "https://images.unsplash.com/photo-1532634733-cae1395e440f?q=80&w=2072",
    heroOverlayOpacity: 80,
    heroPrimaryCtaLabel: "Upptäck vårt sortiment",
    heroPrimaryCtaLink: "/produkter",
    heroSecondaryCtaLabel: "Besök Rulleriet",
    heroSecondaryCtaLink: "/rulleriet",
    productsTitle: "Våra produkter",
    productsIntro: "Varje produkt är ett bevis på vårt engagemang för hantverket och kvaliteten",
    productsCtaLabel: "Se alla produkter",
    newsTitle: "Nyheter",
    newsIntro: "Håll dig uppdaterad med det senaste från bryggeriet",
    newsCtaLabel: "Se alla evenemang",
    servicesTitle: "Våra tjänster",
    servicesIntro: "Vi erbjuder mer än bara öl – vi skapar upplevelser",
    ctaTitle: "Beställ enkelt till Systembolaget",
    ctaLead: "Vår öl och cider går att köpa och beställa till vilket Systembolag som helst i landet.",
    ctaBody: "Inom kort står din dryck på hyllan, redo att avnjutas. Upptäck den äkta smaken av hantverk – från oss till dig.",
    ctaPrimaryLabel: "Se vårt sortiment",
    ctaPrimaryLink: "/produkter",
    ctaSecondaryLabel: "Kontakta oss",
    ctaSecondaryLink: "/kontakt",
    ctaCards: [
      { icon: "📍", title: "Besök oss", lines: ["Alafors Fabriker", "3 mil norr om Göteborg"] },
      { icon: "🍺", title: "Rulleriet", lines: ["Smakbar & evenemang", "Kolla våra öppettider"] },
      { icon: "✉️", title: "Kontakt", lines: ["info@ahlaforsbryggerier.se"] },
    ],
  };

  const defaultSectionOrder: Array<{ id: HomepageSectionId; enabled: boolean }> = [
    { id: "hero", enabled: true },
    { id: "about", enabled: true },
    { id: "products", enabled: true },
    { id: "news", enabled: true },
    { id: "services", enabled: true },
    { id: "cta", enabled: true },
  ];

  const normalizedSectionOrder = Array.isArray(homepage.sectionOrder)
    ? defaultSectionOrder.map((section) => {
      const match = homepage.sectionOrder.find((entry) => entry?.id === section.id);
      return {
        id: section.id,
        enabled: typeof match?.enabled === "boolean" ? match.enabled : section.enabled,
      };
    })
    : defaultSectionOrder;

  return {
    ...content,
    site,
    homepage: {
      ...homepage,
      heroOverlayOpacity: normalizeHeroOverlayOpacity(homepage.heroOverlayOpacity, 80),
      sectionOrder: normalizedSectionOrder,
      ctaCards: Array.isArray(homepage.ctaCards)
        ? homepage.ctaCards.map((card, index) => ({
          icon: card.icon || ["📍", "🍺", "✉️"][index] || "•",
          title: card.title || "",
          lines: Array.isArray(card.lines) ? card.lines.filter((line) => typeof line === "string") : [],
        }))
        : [],
    },
    about: {
      ...content.about,
      pageHeroOverlayOpacity: normalizeHeroOverlayOpacity(content.about.pageHeroOverlayOpacity, 80),
    },
    productsPage: {
      heroTitle: content.productsPage?.heroTitle || "Våra Produkter",
      heroSubtitle: content.productsPage?.heroSubtitle || "Helmaltsöl bryggt med kärlek efter gamla traditioner",
      heroImage: content.productsPage?.heroImage || "https://images.unsplash.com/photo-1532634733-cae1395e440f?q=80&w=2072",
      heroHighlights: isStringArray(content.productsPage?.heroHighlights)
        ? content.productsPage.heroHighlights
        : ["Färsk humle", "Hantverksmässiga metoder", "Tyska renhetslagarna"],
      heroOverlayOpacity: normalizeHeroOverlayOpacity(content.productsPage?.heroOverlayOpacity, 80),
      seoTitle: content.productsPage?.seoTitle || `${site.companyName} - Produkter`,
      seoDescription: content.productsPage?.seoDescription || site.metadataDescription,
      emptyStateText: content.productsPage?.emptyStateText || "Inga produkter i den här kategorin ännu.",
      ctaTitle: content.productsPage?.ctaTitle || "Beställ till Systembolaget",
      ctaText: content.productsPage?.ctaText || "Vår öl och cider kan beställas till vilket Systembolag som helst i landet.",
      ctaPrimaryLabel: content.productsPage?.ctaPrimaryLabel || "Besök Rulleriet",
      ctaPrimaryLink: content.productsPage?.ctaPrimaryLink || "/rulleriet",
      ctaSecondaryLabel: content.productsPage?.ctaSecondaryLabel || "Kontakta oss",
      ctaSecondaryLink: content.productsPage?.ctaSecondaryLink || "/kontakt",
    },
    productDetailPage: {
      heroOverlayOpacity: normalizeHeroOverlayOpacity(
        content.productDetailPage?.heroOverlayOpacity
          ?? (content.site as { productDetailHeroOverlayOpacity?: unknown } | undefined)?.productDetailHeroOverlayOpacity,
        80,
      ),
      backLinkLabel: content.productDetailPage?.backLinkLabel || "Tillbaka till produkter",
      descriptionHeading: content.productDetailPage?.descriptionHeading || "Om produkten",
      linksHeading: content.productDetailPage?.linksHeading || "Länkar",
      linksEmptyText: content.productDetailPage?.linksEmptyText || "Inga länkar tillagda ännu.",
      linkActionLabel: content.productDetailPage?.linkActionLabel || "Öppna",
      dataHeading: content.productDetailPage?.dataHeading || "Produktdata",
      articleNumberLabel: content.productDetailPage?.articleNumberLabel || "Artikelnummer",
      publishedLabel: content.productDetailPage?.publishedLabel || "Publicerad",
      relatedCountLabel: content.productDetailPage?.relatedCountLabel || "Liknande produkter",
      relatedEyebrow: content.productDetailPage?.relatedEyebrow || "Mer att upptäcka",
      relatedTitle: content.productDetailPage?.relatedTitle || "Relaterade produkter",
      allProductsLabel: content.productDetailPage?.allProductsLabel || "Alla produkter",
      viewProductLabel: content.productDetailPage?.viewProductLabel || "Visa produkt",
    },
    servicesPage: {
      heroTitle: content.servicesPage?.heroTitle || "Våra tjänster",
      heroSubtitle: content.servicesPage?.heroSubtitle || "Vi hjälper gärna till med allt som ett bryggeri kan erbjuda",
      heroImage: content.servicesPage?.heroImage || "https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?q=80&w=2070",
      heroOverlayOpacity: normalizeHeroOverlayOpacity(content.servicesPage?.heroOverlayOpacity, 80),
      seoTitle: content.servicesPage?.seoTitle || `${site.companyName} - Tjänster`,
      seoDescription: content.servicesPage?.seoDescription || site.metadataDescription,
      introText: content.servicesPage?.introText || "Vi som ett mindre bryggeri har möjligheten att se till våra kunders behov. Ni som restaurangägare, festfixare eller ölintresserad skall känna er välkommen hos oss.",
      ctaTitle: content.servicesPage?.ctaTitle || "Intresserad?",
      ctaText: content.servicesPage?.ctaText || "Kontakta oss för mer information om våra tjänster och hur vi kan hjälpa er.",
      ctaPrimaryLabel: content.servicesPage?.ctaPrimaryLabel || "Kontakta oss",
      ctaPrimaryLink: content.servicesPage?.ctaPrimaryLink || "/kontakt",
      ctaSecondaryLabel: content.servicesPage?.ctaSecondaryLabel || "Se våra produkter",
      ctaSecondaryLink: content.servicesPage?.ctaSecondaryLink || "/produkter",
    },
    recipesPage: {
      heroTitle: content.recipesPage?.heroTitle || "Recept",
      heroSubtitle: content.recipesPage?.heroSubtitle || "Spännande dryckesrecept och maträtter med våra öl",
      heroImage: content.recipesPage?.heroImage || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070",
      heroOverlayOpacity: normalizeHeroOverlayOpacity(content.recipesPage?.heroOverlayOpacity, 80),
      seoTitle: content.recipesPage?.seoTitle || `${site.companyName} - Recept`,
      seoDescription: content.recipesPage?.seoDescription || site.metadataDescription,
      introTitle: content.recipesPage?.introTitle || "Vi presenterar ett urval av spännande recept som du kan prova hemma.",
      introText: content.recipesPage?.introText || "Vi presenterar ett urval av spännande recept som du kan prova hemma.",
      introSubtext: content.recipesPage?.introSubtext || "Utforska våra enkla steg-för-steg-instruktioner med våra öl som huvudingrediens eller som perfekt tillbehör.",
      ctaTitle: content.recipesPage?.ctaTitle || "Upptäck våra produkter",
      ctaText: content.recipesPage?.ctaText || "Alla våra öl och cider finns att beställa på Systembolaget över hela landet.",
      ctaPrimaryLabel: content.recipesPage?.ctaPrimaryLabel || "Se produkter",
      ctaPrimaryLink: content.recipesPage?.ctaPrimaryLink || "/produkter",
      ctaSecondaryLabel: content.recipesPage?.ctaSecondaryLabel || "Kontakta oss",
      ctaSecondaryLink: content.recipesPage?.ctaSecondaryLink || "/kontakt",
    },
    rulleriet: {
      ...content.rulleriet,
      heroOverlayOpacity: normalizeHeroOverlayOpacity(content.rulleriet.heroOverlayOpacity, 60),
      events: normalizeRullerietEvents(content.rulleriet.events),
    },
    contact: {
      ...content.contact,
      heroOverlayOpacity: normalizeHeroOverlayOpacity(content.contact.heroOverlayOpacity, 80),
    },
  };
}

export function assertSiteContent(value: unknown): asserts value is SiteContent {
  if (!value || typeof value !== "object") {
    throw new Error("CMS-innehållet måste vara ett objekt.");
  }

  const candidate = value as Partial<SiteContent>;

  if (!candidate.site || !candidate.homepage || !candidate.about || !candidate.productsPage || !candidate.productDetailPage || !candidate.products || !candidate.news || !candidate.services || !candidate.servicesPage || !candidate.recipes || !candidate.recipesPage || !candidate.rulleriet || !candidate.contact) {
    throw new Error("CMS-innehållet saknar en eller flera toppnivåsektioner.");
  }

  if (!isStringArray(candidate.site.metadataKeywords)) {
    throw new Error("site.metadataKeywords måste vara en lista med strängar.");
  }

  if (
    !Array.isArray(candidate.homepage.sectionOrder)
    || candidate.homepage.sectionOrder.some((section) => {
      if (!section || typeof section !== "object") {
        return true;
      }
      const typed = section as { id?: unknown; enabled?: unknown };
      return !["hero", "about", "products", "news", "services", "cta"].includes(String(typed.id))
        || typeof typed.enabled !== "boolean";
    })
    || !Array.isArray(candidate.homepage.ctaCards)
    || candidate.homepage.ctaCards.some((card) => !card || typeof card !== "object" || !isStringArray((card as { lines?: unknown }).lines))
  ) {
    throw new Error("homepage-sektionen har ogiltigt format.");
  }

  if (!isStringArray(candidate.about.homepageParagraphs) || !Array.isArray(candidate.about.stats)) {
    throw new Error("about-sektionen har ogiltigt format.");
  }

  if (!Array.isArray(candidate.products) || !Array.isArray(candidate.news) || !Array.isArray(candidate.services) || !Array.isArray(candidate.recipes)) {
    throw new Error("Samlingar som products/news/services/recipes måste vara arrayer.");
  }

  if (
    !isRullerietEventArray(candidate.rulleriet.events)
    || !isStringArray(candidate.rulleriet.introParagraphs)
    || !isRullerietPostArray(candidate.rulleriet.blogPosts)
  ) {
    throw new Error("rulleriet-sektionen har ogiltigt format.");
  }

  if (!isStringArray(candidate.contact.addressLines) || !isStringArray(candidate.contact.productsInfoParagraphs) || !Array.isArray(candidate.contact.socialLinks)) {
    throw new Error("contact-sektionen har ogiltigt format.");
  }
}
