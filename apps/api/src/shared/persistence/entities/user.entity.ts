import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  fullName!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'simple-array' })
  roles!: string[];

  @Column({ type: 'varchar', length: 16 })
  status!: string; // PENDING | ACTIVE

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 8, nullable: true })
  countryCode!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  area!: string | null;

  @Column({ type: 'int', nullable: true })
  coverageRadiusKm!: number | null;

  @Column({ type: 'simple-array', nullable: true })
  workerCategories!: string[] | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  workerHeadline!: string | null;

  @Column({ type: 'text', nullable: true })
  workerBio!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  preferredPaymentMethod!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  documentType!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  documentNumber!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  birthDate!: string | null; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 24, nullable: true })
  gender!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  nationality!: string | null;
}

