import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const REGISTRATION_FLOW_DATE_TYPE = (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres' ? 'timestamp' : 'datetime';

@Entity({ name: 'auth_registration_flows' })
export class RegistrationFlowEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'flow_id' })
  flowId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'expires_at', type: REGISTRATION_FLOW_DATE_TYPE as any, nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'completed_at', type: REGISTRATION_FLOW_DATE_TYPE as any, nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName!: string;

  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 32 })
  phoneNumber!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'simple-array' })
  roles!: string[];

  @Column({ type: 'varchar', length: 16, default: 'PENDING' })
  status!: string;

  @Column({ name: 'next_stage', type: 'varchar', length: 32, default: 'VERIFY' })
  nextStage!: string;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified!: boolean;

  @Column({ name: 'country_code', type: 'varchar', length: 8, nullable: true })
  countryCode!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  area!: string | null;

  @Column({ name: 'coverage_radius_km', type: 'int', nullable: true })
  coverageRadiusKm!: number | null;

  @Column({ name: 'worker_categories', type: 'simple-array', nullable: true })
  workerCategories!: string[] | null;

  @Column({ name: 'worker_headline', type: 'varchar', length: 200, nullable: true })
  workerHeadline!: string | null;

  @Column({ name: 'worker_bio', type: 'text', nullable: true })
  workerBio!: string | null;

  @Column({ name: 'preferred_payment_method', type: 'varchar', length: 16, nullable: true })
  preferredPaymentMethod!: string | null;

  @Column({ name: 'document_type', type: 'varchar', length: 16, nullable: true })
  documentType!: string | null;

  @Column({ name: 'document_number', type: 'varchar', length: 64, nullable: true })
  documentNumber!: string | null;

  @Column({ name: 'birth_date', type: 'varchar', length: 10, nullable: true })
  birthDate!: string | null;

  @Column({ type: 'varchar', length: 24, nullable: true })
  gender!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  nationality!: string | null;
}

