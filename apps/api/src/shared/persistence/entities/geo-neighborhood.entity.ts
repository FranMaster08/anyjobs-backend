import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GeoMunicipalityEntity } from './geo-municipality.entity';

@Entity('geo_neighborhoods')
@Index('IDX_geo_neighborhoods_municipality_name_unique', ['municipalityId', 'name'], { unique: true })
export class GeoNeighborhoodEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'municipality_id', type: 'uuid' })
  municipalityId!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => GeoMunicipalityEntity, (m) => m.neighborhoods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'municipality_id' })
  municipality!: GeoMunicipalityEntity;
}
