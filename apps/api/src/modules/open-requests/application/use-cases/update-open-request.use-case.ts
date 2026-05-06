import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfiguration } from '../../../../config/configuration';
import { AppException } from '../../../../shared/errors/app-exception';
import { resolvePublicAssetUrl } from '../../../../shared/url/resolve-public-asset-url';
import { IMAGE_STORAGE_PROVIDER, OPEN_REQUESTS_REPOSITORY } from '../ports';
import type { OpenRequestsRepositoryPort, UpdateOpenRequestRecordPatch } from '../ports';
import type { OpenRequestDetail } from '../../domain';
import type { ImageStorageProvider } from '../ports';

export interface UpdateOpenRequestInput {
  id: string;
  userId: string;
  patch: UpdateOpenRequestRecordPatch;
  uploadedImages?: Array<{ bytes: Buffer; mimeType: string; originalName?: string; alt?: string }>;
}

@Injectable()
export class UpdateOpenRequestUseCase {
  constructor(
    @Inject(OPEN_REQUESTS_REPOSITORY) private readonly repo: OpenRequestsRepositoryPort,
    @Inject(IMAGE_STORAGE_PROVIDER) private readonly storage: ImageStorageProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: UpdateOpenRequestInput): Promise<OpenRequestDetail> {
    const meta = await this.repo.findOwnerId(input.id);
    if (!meta) throw new AppException('OPEN_REQUEST.NOT_FOUND');
    if (meta.ownerUserId == null || meta.ownerUserId !== input.userId) {
      throw new ForbiddenException();
    }

    const uploadedImages = await Promise.all(
      (input.uploadedImages ?? []).map(async (file) => {
        const saved = await this.storage.save({
          bytes: file.bytes,
          mimeType: file.mimeType,
          originalName: file.originalName,
        });
        const fallbackAlt = file.originalName?.trim() || 'Imagen de la solicitud';
        return {
          url: saved.url,
          alt: (file.alt ?? '').trim() || fallbackAlt,
          storageKey: saved.storageKey,
        };
      }),
    );

    const existingImageRecords = await this.repo.listImageRecords(input.id);
    const hasForeignOwnedImages = existingImageRecords.some((img) => img.ownerUserId !== input.userId);
    if (hasForeignOwnedImages && (input.patch.images !== undefined || uploadedImages.length > 0)) {
      await Promise.all(uploadedImages.map((img) => this.storage.delete(img.storageKey)));
      throw new ForbiddenException();
    }

    const current = await this.repo.getById(input.id);
    if (!current) {
      await Promise.all(uploadedImages.map((img) => this.storage.delete(img.storageKey)));
      throw new AppException('OPEN_REQUEST.NOT_FOUND');
    }

    const baseImages = input.patch.images ?? current.images;
    const finalImages = [
      ...baseImages.map((img) => ({ url: img.url, alt: img.alt, storageKey: null as string | null })),
      ...uploadedImages,
    ];

    if (finalImages.length < 1 || finalImages.length > 6) {
      await Promise.all(uploadedImages.map((img) => this.storage.delete(img.storageKey)));
      throw new AppException('VALIDATION.INVALID_INPUT', 'Invalid open request image count', {
        images: 'Open request must contain between 1 and 6 images.',
      });
    }

    const publicBaseUrl = this.configService.getOrThrow<AppConfiguration['app']>('app').publicUrl;
    const persistImages = finalImages.map((img) => ({
      ...img,
      url: resolvePublicAssetUrl(publicBaseUrl, img.url),
    }));
    const primaryUrlCandidate = finalImages[0]?.url ?? input.patch.imageUrl;
    const primaryUrl =
      primaryUrlCandidate !== undefined
        ? resolvePublicAssetUrl(publicBaseUrl, primaryUrlCandidate)
        : undefined;
    const primaryAlt = finalImages[0]?.alt ?? input.patch.imageAlt;

    try {
      const updated = await this.repo.updatePartial(input.id, {
        ...input.patch,
        ...(primaryUrl !== undefined ? { imageUrl: primaryUrl } : {}),
        ...(primaryAlt !== undefined ? { imageAlt: primaryAlt } : {}),
        images: persistImages.map((img) => ({ url: img.url, alt: img.alt })),
      });
      if (!updated) throw new AppException('OPEN_REQUEST.NOT_FOUND');
      await this.repo.replaceImages(input.id, input.userId, persistImages);
      return (await this.repo.getById(input.id)) ?? updated;
    } catch (error) {
      await Promise.all(uploadedImages.map((img) => this.storage.delete(img.storageKey)));
      throw error;
    }
  }
}
