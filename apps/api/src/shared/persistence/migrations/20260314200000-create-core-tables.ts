import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCoreTables20260314200000 implements MigrationInterface {
  name = 'CreateCoreTables20260314200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const DEFAULT_SITE_CONFIG_ID = '00000000-0000-0000-0000-000000000001';
    const OPEN_REQUEST_1_ID = '00000000-0000-0000-0000-000000000101';
    const OPEN_REQUEST_2_ID = '00000000-0000-0000-0000-000000000102';

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'fullName', type: 'varchar', length: '200' },
          { name: 'email', type: 'varchar', length: '320' },
          { name: 'phoneNumber', type: 'varchar', length: '32' },
          { name: 'passwordHash', type: 'varchar', length: '255' },
          { name: 'roles', type: 'varchar' },
          { name: 'status', type: 'varchar', length: '16' },
          { name: 'emailVerified', type: 'boolean', default: false },
          { name: 'phoneVerified', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'countryCode', type: 'varchar', length: '8', isNullable: true },
          { name: 'city', type: 'varchar', length: '120', isNullable: true },
          { name: 'area', type: 'varchar', length: '120', isNullable: true },
          { name: 'coverageRadiusKm', type: 'int', isNullable: true },
          { name: 'workerCategories', type: 'varchar', isNullable: true },
          { name: 'workerHeadline', type: 'varchar', length: '200', isNullable: true },
          { name: 'workerBio', type: 'text', isNullable: true },
          { name: 'preferredPaymentMethod', type: 'varchar', length: '16', isNullable: true },
          { name: 'documentType', type: 'varchar', length: '16', isNullable: true },
          { name: 'documentNumber', type: 'varchar', length: '64', isNullable: true },
          { name: 'birthDate', type: 'varchar', length: '10', isNullable: true },
          { name: 'gender', type: 'varchar', length: '24', isNullable: true },
          { name: 'nationality', type: 'varchar', length: '120', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email_unique',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_phone_unique',
        columnNames: ['phoneNumber'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'auth_registration_flows',
        columns: [
          { name: 'flowId', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'emailVerified', type: 'boolean', default: false },
          { name: 'phoneVerified', type: 'boolean', default: false },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'auth_registration_flows',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'proposals',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'requestId', type: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'authorName', type: 'varchar', length: '200' },
          { name: 'authorSubtitle', type: 'varchar', length: '200' },
          { name: 'authorRating', type: 'float', isNullable: true },
          { name: 'authorReviewsCount', type: 'int', isNullable: true },
          { name: 'whoAmI', type: 'varchar', length: '200' },
          { name: 'message', type: 'text' },
          { name: 'estimate', type: 'varchar', length: '200' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'status', type: 'varchar', length: '16', default: "'SENT'" },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('proposals', new TableIndex({ name: 'IDX_proposals_userId', columnNames: ['userId'] }));
    await queryRunner.createIndex(
      'proposals',
      new TableIndex({ name: 'IDX_proposals_requestId', columnNames: ['requestId'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'open_requests',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'excerpt', type: 'varchar', length: '400' },
          { name: 'description', type: 'text' },
          { name: 'tags', type: 'varchar' },
          { name: 'locationLabel', type: 'varchar', length: '200' },
          { name: 'publishedAtLabel', type: 'varchar', length: '64' },
          { name: 'publishedAtSort', type: 'bigint' },
          { name: 'budgetLabel', type: 'varchar', length: '64' },
          { name: 'imageUrl', type: 'varchar', length: '500' },
          { name: 'imageAlt', type: 'varchar', length: '200' },
          { name: 'provider', type: 'text' },
          { name: 'reputation', type: 'float' },
          { name: 'reviewsCount', type: 'int' },
          { name: 'providerReviews', type: 'text' },
          { name: 'contactPhone', type: 'varchar', length: '32' },
          { name: 'contactEmail', type: 'varchar', length: '320' },
          { name: 'images', type: 'text' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'open_requests',
      new TableIndex({ name: 'IDX_open_requests_publishedAtSort', columnNames: ['publishedAtSort'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'site_config',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'brandName', type: 'varchar', length: '200' },
          { name: 'hero', type: 'text' },
          { name: 'sections', type: 'text' },
        ],
      }),
      true,
    );

    // Seeds mínimos (alineados con la data in-memory previa)
    await queryRunner.manager.insert('site_config', {
      id: DEFAULT_SITE_CONFIG_ID,
      brandName: 'AnyJobs',
      hero: JSON.stringify({ title: 'Encuentra ayuda cerca de ti', subtitle: 'Profesionales verificados para tus necesidades.' }),
      sections: JSON.stringify({
        requests: { label: 'Solicitudes', title: 'Últimas solicitudes', cta: 'Ver más' },
        location: {
          label: 'Ubicación',
          title: 'Busca por zona',
          body: 'Elige tu zona para ver profesionales disponibles.',
          openMap: 'Abrir mapa',
          viewMap: 'Ver mapa',
          preview: {
            title: 'Tu zona',
            hintNoLocation: 'Selecciona una ubicación para ver solicitudes cerca.',
            hintWithLocation: 'Mostrando solicitudes cerca de tu ubicación.',
          },
        },
        contact: {
          label: 'Contacto',
          title: '¿Necesitas ayuda?',
          intro: 'Escríbenos o llámanos y te ayudamos.',
          phone: { label: 'Teléfono', value: '+34 600 111 222', hint: 'L-V 9:00-18:00', href: 'tel:+34600111222' },
          email: { label: 'Email', value: 'hola@anyjobs.example', hint: 'Respuesta en 24h', href: 'mailto:hola@anyjobs.example' },
        },
      }),
    });

    const now = Date.now();
    await queryRunner.manager.insert('open_requests', [
      {
        id: OPEN_REQUEST_1_ID,
        title: 'Limpieza profunda de piso',
        excerpt: 'Necesito una limpieza profunda.',
        description: 'Busco una persona para una limpieza profunda de un piso de 70m2.',
        tags: 'Limpieza',
        locationLabel: 'Barcelona · Eixample',
        publishedAtLabel: 'Hace 2 días',
        publishedAtSort: String(now - 0),
        budgetLabel: '€60',
        imageUrl: 'https://picsum.photos/seed/req-1/640/360',
        imageAlt: 'Imagen de la solicitud',
        provider: JSON.stringify({ name: 'Limpiezas Express', badge: 'PRO', subtitle: 'Responde en 1h' }),
        reputation: 4.8,
        reviewsCount: 120,
        providerReviews: JSON.stringify([{ author: 'Ana', rating: 5, dateLabel: 'Ene 2026', text: 'Muy buen servicio.' }]),
        contactPhone: '+34600111222',
        contactEmail: 'contacto@example.com',
        images: JSON.stringify([]),
      },
      {
        id: OPEN_REQUEST_2_ID,
        title: 'Montaje de mueble',
        excerpt: 'Necesito montar un armario.',
        description: 'Montaje de un armario IKEA, se requiere experiencia.',
        tags: 'Montaje',
        locationLabel: 'Madrid · Centro',
        publishedAtLabel: 'Hace 5 días',
        publishedAtSort: String(now - 1000 * 60 * 60 * 24),
        budgetLabel: '€40',
        imageUrl: 'https://picsum.photos/seed/req-2/640/360',
        imageAlt: 'Imagen de la solicitud',
        provider: JSON.stringify({ name: 'Manitas 24/7', badge: 'TOP', subtitle: 'Garantía 30 días' }),
        reputation: 4.6,
        reviewsCount: 89,
        providerReviews: JSON.stringify([{ author: 'Luis', rating: 4, dateLabel: 'Feb 2026', text: 'Rápido y correcto.' }]),
        contactPhone: '+34600111333',
        contactEmail: 'soporte@example.com',
        images: JSON.stringify([{ url: 'https://picsum.photos/seed/req-2/800/600', alt: 'Foto del mueble' }]),
      },
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('site_config', true);
    await queryRunner.dropTable('open_requests', true);
    await queryRunner.dropTable('proposals', true);
    await queryRunner.dropTable('auth_registration_flows', true);
    await queryRunner.dropTable('users', true);
  }
}

