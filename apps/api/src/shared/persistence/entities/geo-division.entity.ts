import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GeoMunicipalityEntity } from './geo-municipality.entity';

@Entity('geo_divisions')
@Index('IDX_geo_divisions_country_name_unique', ['countryCode', 'name'], { unique: true })
export class GeoDivisionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ name: 'division_type', type: 'varchar', length: 20 })
  divisionType!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany(() => GeoMunicipalityEntity, (m) => m.division, { cascade: true })
  municipalities!: GeoMunicipalityEntity[];
}
