import type { UpdateOpenRequestRecordPatch } from '../../application/ports/open-requests-repository.port';
import type { PatchOpenRequestDto } from '../dtos/patch-open-request.dto';

export function patchDtoToRecord(dto: PatchOpenRequestDto): UpdateOpenRequestRecordPatch {
  const p: UpdateOpenRequestRecordPatch = {};
  if (dto.title !== undefined) p.title = dto.title;
  if (dto.excerpt !== undefined) p.excerpt = dto.excerpt;
  if (dto.description !== undefined) p.description = dto.description;
  if (dto.tags !== undefined) p.tags = dto.tags;
  if (dto.locationLabel !== undefined) p.locationLabel = dto.locationLabel;
  if (dto.publishedAtLabel !== undefined) p.publishedAtLabel = dto.publishedAtLabel;
  if (dto.budgetLabel !== undefined) p.budgetLabel = dto.budgetLabel;
  if (dto.imageUrl !== undefined) p.imageUrl = dto.imageUrl;
  if (dto.imageAlt !== undefined) p.imageAlt = dto.imageAlt;
  if (dto.provider !== undefined) p.provider = { ...dto.provider };
  if (dto.reputation !== undefined) p.reputation = dto.reputation;
  if (dto.reviewsCount !== undefined) p.reviewsCount = dto.reviewsCount;
  if (dto.providerReviews !== undefined) p.providerReviews = dto.providerReviews.map((r) => ({ ...r }));
  if (dto.contactPhone !== undefined) p.contactPhone = dto.contactPhone;
  if (dto.contactEmail !== undefined) p.contactEmail = dto.contactEmail;
  if (dto.images !== undefined) p.images = dto.images.map((i) => ({ ...i }));
  return p;
}
