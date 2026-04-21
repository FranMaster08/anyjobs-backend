import 'reflect-metadata';
import { configuration } from '../../../config/configuration';
import { ScryptPasswordHasher } from '../../../modules/auth/infrastructure/adapters/scrypt-password-hasher';
import dataSource from '../typeorm.datasource';

function json(value: unknown): string {
  return JSON.stringify(value);
}

async function main(): Promise<void> {
  // Fuerza carga/validación de env temprano (mismo comportamiento que la app)
  const config = configuration();

  await dataSource.initialize();
  try {
    // Site config (id fijo)
    await dataSource.query(
      `
      INSERT INTO site_config (id, brand_name, hero, sections)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        '00000000-0000-0000-0000-000000000001',
        'AnyJobs',
        json({ title: 'Encuentra ayuda cerca de ti', subtitle: 'Profesionales verificados para tus necesidades.' }),
        json({
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
            email: {
              label: 'Email',
              value: 'hola@anyjobs.example',
              hint: 'Respuesta en 24h',
              href: 'mailto:hola@anyjobs.example',
            },
          },
        }),
      ],
    );

    // Usuario demo (opcional) para pruebas manuales — antes de open_requests para poder referenciar owner_user_id.
    // NOTA: passwordHash usa el mismo algoritmo que el login (scrypt).
    const demoPassword =
      config.app.nodeEnv === 'production' ? undefined : (config.seed.demoPassword ?? 'Demo1234!');
    if (!demoPassword) {
      throw new Error('SEED_DEMO_PASSWORD is required to seed the demo user in production');
    }
    const passwordHasher = new ScryptPasswordHasher();
    const demoPasswordHash = await passwordHasher.hashPassword(demoPassword);
    const demoUserId = '00000000-0000-0000-0000-000000001001';
    await dataSource.query(
      `
      INSERT INTO users (
        id, full_name, email, phone_number, password_hash, roles, status,
        email_verified, phone_verified, country_code, city, area
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (email) DO UPDATE SET
        id = EXCLUDED.id,
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        password_hash = EXCLUDED.password_hash,
        roles = EXCLUDED.roles,
        status = EXCLUDED.status,
        email_verified = EXCLUDED.email_verified,
        phone_verified = EXCLUDED.phone_verified,
        country_code = EXCLUDED.country_code,
        city = EXCLUDED.city,
        area = EXCLUDED.area
    `,
      [
        demoUserId,
        'Usuario Demo',
        'demo@anyjobs.test',
        '+34911111111',
        demoPasswordHash,
        'CLIENT',
        'ACTIVE',
        true,
        true,
        'ES',
        'Madrid',
        'Centro',
      ],
    );

    const now = Date.now();

    // Open requests (ids fijos) + 1 extra para pruebas (titular: usuario demo)
    await dataSource.query(
      `
      INSERT INTO open_requests (
        id, title, excerpt, description, tags, location_label, published_at_label, published_at_sort,
        budget_label, image_url, image_alt, provider, reputation, reviews_count, provider_reviews,
        contact_phone, contact_email, images, owner_user_id
      )
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19),
        ($20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38),
        ($39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        '00000000-0000-0000-0000-000000000101',
        'Limpieza profunda de piso',
        'Necesito una limpieza profunda.',
        'Busco una persona para una limpieza profunda de un piso de 70m2.',
        'Limpieza',
        'Barcelona · Eixample',
        'Hace 2 días',
        now,
        '€60',
        'https://picsum.photos/seed/req-1/640/360',
        'Imagen de la solicitud',
        json({ name: 'Limpiezas Express', badge: 'PRO', subtitle: 'Responde en 1h' }),
        4.8,
        120,
        json([{ author: 'Ana', rating: 5, dateLabel: 'Ene 2026', text: 'Muy buen servicio.' }]),
        '+34600111222',
        'contacto@example.com',
        json([]),
        demoUserId,

        '00000000-0000-0000-0000-000000000102',
        'Montaje de mueble',
        'Necesito montar un armario.',
        'Montaje de un armario IKEA, se requiere experiencia.',
        'Montaje',
        'Madrid · Centro',
        'Hace 5 días',
        now - 1000 * 60 * 60 * 24,
        '€40',
        'https://picsum.photos/seed/req-2/640/360',
        'Imagen de la solicitud',
        json({ name: 'Manitas 24/7', badge: 'TOP', subtitle: 'Garantía 30 días' }),
        4.6,
        89,
        json([{ author: 'Luis', rating: 4, dateLabel: 'Feb 2026', text: 'Rápido y correcto.' }]),
        '+34600111333',
        'soporte@example.com',
        json([{ url: 'https://picsum.photos/seed/req-2/800/600', alt: 'Foto del mueble' }]),
        demoUserId,

        '00000000-0000-0000-0000-000000000103',
        'Pintura de habitación',
        'Necesito pintar una habitación.',
        'Pintura de una habitación pequeña (10m2), pintura blanca. Yo pongo materiales.',
        'Pintura,Manitas',
        'Valencia · Ruzafa',
        'Hace 1 día',
        now - 1000 * 60 * 60 * 6,
        '€90',
        'https://picsum.photos/seed/req-3/640/360',
        'Imagen de la solicitud',
        json({ name: 'Pintores Express', badge: 'PRO', subtitle: 'Presupuesto en el día' }),
        4.9,
        210,
        json([{ author: 'Sofía', rating: 5, dateLabel: 'Mar 2026', text: 'Excelente acabado.' }]),
        '+34600111444',
        'hola@pintores.example',
        json([]),
        demoUserId,
      ],
    );

    // Postulación (solicitud para postular) con 5 fotos (galería)
    await dataSource.query(
      `
      INSERT INTO open_requests (
        id, title, excerpt, description, tags, location_label, published_at_label, published_at_sort,
        budget_label, image_url, image_alt, provider, reputation, reviews_count, provider_reviews,
        contact_phone, contact_email, images, owner_user_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        description = EXCLUDED.description,
        tags = EXCLUDED.tags,
        location_label = EXCLUDED.location_label,
        published_at_label = EXCLUDED.published_at_label,
        published_at_sort = EXCLUDED.published_at_sort,
        budget_label = EXCLUDED.budget_label,
        image_url = EXCLUDED.image_url,
        image_alt = EXCLUDED.image_alt,
        provider = EXCLUDED.provider,
        reputation = EXCLUDED.reputation,
        reviews_count = EXCLUDED.reviews_count,
        provider_reviews = EXCLUDED.provider_reviews,
        contact_phone = EXCLUDED.contact_phone,
        contact_email = EXCLUDED.contact_email,
        images = EXCLUDED.images,
        owner_user_id = EXCLUDED.owner_user_id
    `,
      [
        '00000000-0000-0000-0000-000000000104',
        'Instalación de estanterías (5 fotos)',
        'Necesito instalar estanterías.',
        'Instalar 3 estanterías en pared (taco + tornillo). Tengo las estanterías, no tengo herramientas.',
        'Manitas,Montaje',
        'Sevilla · Triana',
        'Hace 3 horas',
        now - 1000 * 60 * 60 * 3,
        '€55',
        // 16:9 para que el recorte (cover) se vea bien en la galería.
        'https://picsum.photos/seed/req-104/1280/720',
        'Imagen de la solicitud',
        json({ name: 'Hogar Pro', badge: 'PRO', subtitle: 'Presupuesto rápido' }),
        4.7,
        56,
        json([
          { author: 'Carlos', rating: 5, dateLabel: 'Mar 2026', text: 'Muy prolijo.' },
          { author: 'Marta', rating: 4, dateLabel: 'Feb 2026', text: 'Cumplió en tiempo.' },
        ]),
        '+34600111555',
        'soporte@hogarpro.example',
        json([
          { url: 'https://picsum.photos/seed/req-104-1/1280/720', alt: 'Foto 1' },
          { url: 'https://picsum.photos/seed/req-104-2/1280/720', alt: 'Foto 2' },
          { url: 'https://picsum.photos/seed/req-104-3/1280/720', alt: 'Foto 3' },
          { url: 'https://picsum.photos/seed/req-104-4/1280/720', alt: 'Foto 4' },
          { url: 'https://picsum.photos/seed/req-104-5/1280/720', alt: 'Foto 5' },
        ]),
        demoUserId,
      ],
    );
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] failed', err);
  process.exitCode = 1;
});

