import { ApiProperty } from '@nestjs/swagger';

export class SiteHeroDto {
  @ApiProperty({ example: 'Encuentra ayuda cerca de ti' })
  title!: string;

  @ApiProperty({ example: 'Profesionales verificados para tus necesidades.' })
  subtitle!: string;
}

export class SiteRequestsSectionDto {
  @ApiProperty({ example: 'Solicitudes' })
  label!: string;

  @ApiProperty({ example: 'Últimas solicitudes' })
  title!: string;

  @ApiProperty({ example: 'Ver más' })
  cta!: string;
}

export class SiteLocationPreviewDto {
  @ApiProperty({ example: 'Tu zona' })
  title!: string;

  @ApiProperty({ example: 'Selecciona una ubicación para ver solicitudes cerca.' })
  hintNoLocation!: string;

  @ApiProperty({ example: 'Mostrando solicitudes cerca de tu ubicación.' })
  hintWithLocation!: string;
}

export class SiteLocationSectionDto {
  @ApiProperty({ example: 'Ubicación' })
  label!: string;

  @ApiProperty({ example: 'Busca por zona' })
  title!: string;

  @ApiProperty({ example: 'Elige tu zona para ver profesionales disponibles.' })
  body!: string;

  @ApiProperty({ example: 'Abrir mapa' })
  openMap!: string;

  @ApiProperty({ example: 'Ver mapa' })
  viewMap!: string;

  @ApiProperty({ type: SiteLocationPreviewDto })
  preview!: SiteLocationPreviewDto;
}

export class SiteContactValueDto {
  @ApiProperty({ example: 'Teléfono' })
  label!: string;

  @ApiProperty({ example: '+34 600 111 222' })
  value!: string;

  @ApiProperty({ example: 'L-V 9:00-18:00' })
  hint!: string;

  @ApiProperty({ example: 'tel:+34600111222' })
  href!: string;
}

export class SiteContactSectionDto {
  @ApiProperty({ example: 'Contacto' })
  label!: string;

  @ApiProperty({ example: '¿Necesitas ayuda?' })
  title!: string;

  @ApiProperty({ example: 'Escríbenos o llámanos y te ayudamos.' })
  intro!: string;

  @ApiProperty({ type: SiteContactValueDto })
  phone!: SiteContactValueDto;

  @ApiProperty({ type: SiteContactValueDto })
  email!: SiteContactValueDto;
}

export class SiteSectionsDto {
  @ApiProperty({ type: SiteRequestsSectionDto })
  requests!: SiteRequestsSectionDto;

  @ApiProperty({ type: SiteLocationSectionDto })
  location!: SiteLocationSectionDto;

  @ApiProperty({ type: SiteContactSectionDto })
  contact!: SiteContactSectionDto;
}

export class SiteConfigResponseDto {
  @ApiProperty({ example: 'AnyJobs' })
  brandName!: string;

  @ApiProperty({ type: SiteHeroDto })
  hero!: SiteHeroDto;

  @ApiProperty({ type: SiteSectionsDto })
  sections!: SiteSectionsDto;
}

