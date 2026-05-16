import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GeoDivisionEntity } from './geo-division.entity';
import { GeoNeighborhoodEntity } from './geo-neighborhood.entity';

@Entity('geo_municipalities')
@Index('IDX_geo_municipalities_division_name_unique', ['divisionId', 'name'], { unique: true })
export class GeoMunicipalityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'division_id', type: 'uuid' })
  divisionId!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => GeoDivisionEntity, (d) => d.municipalities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'division_id' })
  division!: GeoDivisionEntity;

  @OneToMany(() => GeoNeighborhoodEntity, (n) => n.municipality)
  neighborhoods!: GeoNeighborhoodEntity[];
}
