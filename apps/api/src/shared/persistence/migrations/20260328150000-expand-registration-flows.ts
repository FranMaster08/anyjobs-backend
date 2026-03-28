import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ExpandRegistrationFlows20260328150000 implements MigrationInterface {
  name = 'ExpandRegistrationFlows20260328150000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('auth_registration_flows');
    if (!table) return;

    const userForeignKey = table.foreignKeys.find((fk) => fk.columnNames.includes('user_id'));
    if (userForeignKey) {
      await queryRunner.dropForeignKey('auth_registration_flows', userForeignKey);
    }

    const addColumnIfMissing = async (column: TableColumn) => {
      const current = await queryRunner.getTable('auth_registration_flows');
      if (!current?.findColumnByName(column.name)) {
        await queryRunner.addColumn('auth_registration_flows', column);
      }
    };

    const currentUserId = table.findColumnByName('user_id');
    if (currentUserId && !currentUserId.isNullable) {
      await queryRunner.changeColumn(
        'auth_registration_flows',
        'user_id',
        new TableColumn({
          name: 'user_id',
          type: currentUserId.type,
          isNullable: true,
        }),
      );
    }

    await addColumnIfMissing(
      new TableColumn({ name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }),
    );
    await addColumnIfMissing(new TableColumn({ name: 'expires_at', type: 'timestamp', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'completed_at', type: 'timestamp', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'full_name', type: 'varchar', length: '200', default: "''" }));
    await addColumnIfMissing(new TableColumn({ name: 'email', type: 'varchar', length: '320', default: "''" }));
    await addColumnIfMissing(
      new TableColumn({ name: 'phone_number', type: 'varchar', length: '32', default: "''" }),
    );
    await addColumnIfMissing(
      new TableColumn({ name: 'password_hash', type: 'varchar', length: '255', default: "''" }),
    );
    await addColumnIfMissing(new TableColumn({ name: 'roles', type: 'varchar', default: "''" }));
    await addColumnIfMissing(
      new TableColumn({ name: 'status', type: 'varchar', length: '16', default: "'PENDING'" }),
    );
    await addColumnIfMissing(
      new TableColumn({ name: 'next_stage', type: 'varchar', length: '32', default: "'VERIFY'" }),
    );
    await addColumnIfMissing(new TableColumn({ name: 'country_code', type: 'varchar', length: '8', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'city', type: 'varchar', length: '120', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'area', type: 'varchar', length: '120', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'coverage_radius_km', type: 'int', isNullable: true }));
    await addColumnIfMissing(new TableColumn({ name: 'worker_categories', type: 'varchar', isNullable: true }));
    await addColumnIfMissing(
      new TableColumn({ name: 'worker_headline', type: 'varchar', length: '200', isNullable: true }),
    );
    await addColumnIfMissing(new TableColumn({ name: 'worker_bio', type: 'text', isNullable: true }));
    await addColumnIfMissing(
      new TableColumn({ name: 'preferred_payment_method', type: 'varchar', length: '16', isNullable: true }),
    );
    await addColumnIfMissing(
      new TableColumn({ name: 'document_type', type: 'varchar', length: '16', isNullable: true }),
    );
    await addColumnIfMissing(
      new TableColumn({ name: 'document_number', type: 'varchar', length: '64', isNullable: true }),
    );
    await addColumnIfMissing(
      new TableColumn({ name: 'birth_date', type: 'varchar', length: '10', isNullable: true }),
    );
    await addColumnIfMissing(new TableColumn({ name: 'gender', type: 'varchar', length: '24', isNullable: true }));
    await addColumnIfMissing(
      new TableColumn({ name: 'nationality', type: 'varchar', length: '120', isNullable: true }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('auth_registration_flows');
    if (!table) return;

    const dropColumnIfPresent = async (name: string) => {
      const current = await queryRunner.getTable('auth_registration_flows');
      if (current?.findColumnByName(name)) {
        await queryRunner.dropColumn('auth_registration_flows', name);
      }
    };

    await dropColumnIfPresent('nationality');
    await dropColumnIfPresent('gender');
    await dropColumnIfPresent('birth_date');
    await dropColumnIfPresent('document_number');
    await dropColumnIfPresent('document_type');
    await dropColumnIfPresent('preferred_payment_method');
    await dropColumnIfPresent('worker_bio');
    await dropColumnIfPresent('worker_headline');
    await dropColumnIfPresent('worker_categories');
    await dropColumnIfPresent('coverage_radius_km');
    await dropColumnIfPresent('area');
    await dropColumnIfPresent('city');
    await dropColumnIfPresent('country_code');
    await dropColumnIfPresent('next_stage');
    await dropColumnIfPresent('status');
    await dropColumnIfPresent('roles');
    await dropColumnIfPresent('password_hash');
    await dropColumnIfPresent('phone_number');
    await dropColumnIfPresent('email');
    await dropColumnIfPresent('full_name');
    await dropColumnIfPresent('completed_at');
    await dropColumnIfPresent('expires_at');
    await dropColumnIfPresent('updated_at');
  }
}
