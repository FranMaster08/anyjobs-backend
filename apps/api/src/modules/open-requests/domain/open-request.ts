export interface OpenRequestProvider {
  name: string;
  badge: string;
  subtitle: string;
}

export interface OpenRequestProviderReview {
  author: string;
  rating: number;
  dateLabel: string;
  text: string;
}

export interface OpenRequestImage {
  url: string;
  alt: string;
}

export interface OpenRequestListItem {
  id: string;
  imageUrl: string;
  imageAlt: string;
  excerpt: string;
  tags: string[];
  locationLabel: string;
  publishedAtLabel: string;
  budgetLabel: string;
  publishedAtSort: number;
}

export interface OpenRequestDetail {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  tags: string[];
  locationLabel: string;
  publishedAtLabel: string;
  budgetLabel: string;
  provider: OpenRequestProvider;
  reputation: number;
  reviewsCount: number;
  providerReviews: OpenRequestProviderReview[];
  contactPhone: string;
  contactEmail: string;
  images: OpenRequestImage[];
}

