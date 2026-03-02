export interface SiteConfig {
  brandName: string;
  hero: { title: string; subtitle: string };
  sections: {
    requests: { label: string; title: string; cta: string };
    location: {
      label: string;
      title: string;
      body: string;
      openMap: string;
      viewMap: string;
      preview: { title: string; hintNoLocation: string; hintWithLocation: string };
    };
    contact: {
      label: string;
      title: string;
      intro: string;
      phone: { label: string; value: string; hint: string; href: string };
      email: { label: string; value: string; hint: string; href: string };
    };
  };
}

