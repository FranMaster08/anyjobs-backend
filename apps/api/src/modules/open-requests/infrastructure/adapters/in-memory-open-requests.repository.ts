import { Injectable } from '@nestjs/common';
import { buildPageMeta } from '../../../../shared/application/pagination/page-result';
import type { PageRequest } from '../../../../shared/application/pagination/page-request';
import type { PageResult } from '../../../../shared/application/pagination/page-result';
import type { OpenRequestDetail, OpenRequestListItem } from '../../domain/open-request';
import type {
  CreateOpenRequestRecordInput,
  OpenRequestsRepositoryPort,
  UpdateOpenRequestRecordPatch,
} from '../../application/ports/open-requests-repository.port';

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
  private readonly detailsById = new Map<string, OpenRequestDetail>(seedItems.map((x) => [x.id, { ...x }]));

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

  private readonly owners = new Map<string, string | null>(seedItems.map((x) => [x.id, null]));
  private readonly deleted = new Set<string>();

  async list(pageRequest: PageRequest): Promise<PageResult<OpenRequestListItem>> {
    const sorted = [...this.listItems]
      .filter((x) => !this.deleted.has(x.id))
      .sort((a, b) => b.publishedAtSort - a.publishedAtSort || a.id.localeCompare(b.id));
    const totalItems = sorted.length;
    const meta = buildPageMeta(totalItems, pageRequest.page, pageRequest.pageSize);

    const start = (meta.page - 1) * meta.pageSize;
    const end = start + meta.pageSize;
    const items = sorted.slice(start, end);

    return { items, meta };
  }

  async getById(id: string): Promise<OpenRequestDetail | null> {
    if (this.deleted.has(id)) return null;
    const d = this.detailsById.get(id);
    return d ? { ...d } : null;
  }

  async create(input: CreateOpenRequestRecordInput): Promise<OpenRequestDetail> {
    const detail: OpenRequestDetail = {
      id: input.id,
      title: input.title,
      excerpt: input.excerpt,
      description: input.description,
      tags: [...input.tags],
      locationLabel: input.locationLabel,
      publishedAtLabel: input.publishedAtLabel,
      budgetLabel: input.budgetLabel,
      provider: { ...input.provider },
      reputation: input.reputation,
      reviewsCount: input.reviewsCount,
      providerReviews: input.providerReviews.map((r) => ({ ...r })),
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      images: input.images.map((i) => ({ ...i })),
    };
    this.detailsById.set(input.id, detail);
    this.owners.set(input.id, input.ownerUserId);
    this.listItems.push({
      id: input.id,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      excerpt: input.excerpt,
      tags: [...input.tags],
      locationLabel: input.locationLabel,
      publishedAtLabel: input.publishedAtLabel,
      budgetLabel: input.budgetLabel,
      publishedAtSort: input.publishedAtSort,
    });
    return { ...detail };
  }

  async updatePartial(id: string, patch: UpdateOpenRequestRecordPatch): Promise<OpenRequestDetail | null> {
    if (this.deleted.has(id)) return null;
    const cur = this.detailsById.get(id);
    if (!cur) return null;
    const next: OpenRequestDetail = {
      ...cur,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.tags !== undefined ? { tags: [...patch.tags] } : {}),
      ...(patch.locationLabel !== undefined ? { locationLabel: patch.locationLabel } : {}),
      ...(patch.publishedAtLabel !== undefined ? { publishedAtLabel: patch.publishedAtLabel } : {}),
      ...(patch.budgetLabel !== undefined ? { budgetLabel: patch.budgetLabel } : {}),
      ...(patch.provider !== undefined ? { provider: { ...patch.provider } } : {}),
      ...(patch.reputation !== undefined ? { reputation: patch.reputation } : {}),
      ...(patch.reviewsCount !== undefined ? { reviewsCount: patch.reviewsCount } : {}),
      ...(patch.providerReviews !== undefined
        ? { providerReviews: patch.providerReviews.map((r) => ({ ...r })) }
        : {}),
      ...(patch.contactPhone !== undefined ? { contactPhone: patch.contactPhone } : {}),
      ...(patch.contactEmail !== undefined ? { contactEmail: patch.contactEmail } : {}),
      ...(patch.images !== undefined ? { images: patch.images.map((i) => ({ ...i })) } : {}),
    };
    this.detailsById.set(id, next);

    const li = this.listItems.find((x) => x.id === id);
    if (li) {
      if (patch.excerpt !== undefined) li.excerpt = patch.excerpt;
      if (patch.tags !== undefined) li.tags = [...patch.tags];
      if (patch.locationLabel !== undefined) li.locationLabel = patch.locationLabel;
      if (patch.publishedAtLabel !== undefined) li.publishedAtLabel = patch.publishedAtLabel;
      if (patch.budgetLabel !== undefined) li.budgetLabel = patch.budgetLabel;
      if (patch.imageUrl !== undefined) li.imageUrl = patch.imageUrl;
      if (patch.imageAlt !== undefined) li.imageAlt = patch.imageAlt;
      if (patch.publishedAtSort !== undefined) li.publishedAtSort = patch.publishedAtSort;
    }

    return { ...next };
  }

  async softDelete(id: string): Promise<boolean> {
    if (!this.detailsById.has(id) || this.deleted.has(id)) return false;
    this.deleted.add(id);
    return true;
  }

  async findOwnerId(id: string): Promise<{ ownerUserId: string | null } | null> {
    if (this.deleted.has(id)) return null;
    if (!this.detailsById.has(id)) return null;
    return { ownerUserId: this.owners.get(id) ?? null };
  }
}
