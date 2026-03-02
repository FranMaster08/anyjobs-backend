import { Injectable } from '@nestjs/common';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';
import type { OpenRequestsRepositoryPort } from '../../application/ports/open-requests-repository.port';

const seedItems: OpenRequestDetail[] = [
  {
    id: 'req-1',
    title: 'Limpieza profunda de piso',
    excerpt: 'Necesito una limpieza profunda.',
    description: 'Busco una persona para una limpieza profunda de un piso de 70m2.',
    tags: ['Limpieza'],
    locationLabel: 'Barcelona · Eixample',
    publishedAtLabel: 'Hace 2 días',
    budgetLabel: '€60',
    provider: { name: 'Limpiezas Express', badge: 'PRO', subtitle: 'Responde en 1h' },
    reputation: 4.8,
    reviewsCount: 120,
    providerReviews: [
      { author: 'Ana', rating: 5, dateLabel: 'Ene 2026', text: 'Muy buen servicio.' },
    ],
    contactPhone: '+34600111222',
    contactEmail: 'contacto@example.com',
    images: [],
  },
  {
    id: 'req-2',
    title: 'Montaje de mueble',
    excerpt: 'Necesito montar un armario.',
    description: 'Montaje de un armario IKEA, se requiere experiencia.',
    tags: ['Montaje'],
    locationLabel: 'Madrid · Centro',
    publishedAtLabel: 'Hace 5 días',
    budgetLabel: '€40',
    provider: { name: 'Manitas 24/7', badge: 'TOP', subtitle: 'Garantía 30 días' },
    reputation: 4.6,
    reviewsCount: 89,
    providerReviews: [
      { author: 'Luis', rating: 4, dateLabel: 'Feb 2026', text: 'Rápido y correcto.' },
    ],
    contactPhone: '+34600111333',
    contactEmail: 'soporte@example.com',
    images: [{ url: 'https://picsum.photos/seed/req-2/800/600', alt: 'Foto del mueble' }],
  },
];

@Injectable()
export class InMemoryOpenRequestsRepository implements OpenRequestsRepositoryPort {
  private readonly detailsById = new Map<string, OpenRequestDetail>(seedItems.map((x) => [x.id, x]));

  private readonly listItems: OpenRequestListItem[] = seedItems.map((d, idx) => ({
    id: d.id,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(d.id)}/640/360`,
    imageAlt: 'Imagen de la solicitud',
    excerpt: d.excerpt,
    tags: d.tags,
    locationLabel: d.locationLabel,
    publishedAtLabel: d.publishedAtLabel,
    budgetLabel: d.budgetLabel,
    publishedAtSort: Date.now() - idx * 1000 * 60 * 60 * 24,
  }));

  async list(pageRequest: PageRequest): Promise<PageResult<OpenRequestListItem>> {
    const sorted = [...this.listItems].sort((a, b) => b.publishedAtSort - a.publishedAtSort || a.id.localeCompare(b.id));
    const totalItems = sorted.length;
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);

    const start = (meta.page - 1) * meta.pageSize;
    const end = start + meta.pageSize;
    const items = sorted.slice(start, end);

    return { items, meta };
  }

  async getById(id: string): Promise<OpenRequestDetail | null> {
    return this.detailsById.get(id) ?? null;
  }
}

