import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'site_config' })
export class SiteConfigEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  brandName!: string;

  @Column({ type: 'simple-json' })
  hero!: { title: string; subtitle: string };

  @Column({ type: 'simple-json' })
  sections!: any;
}

