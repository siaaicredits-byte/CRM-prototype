#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/49393958032683cfd3feaae92b793e36e19a1cece228205b58d5e57eb243f457/contract';
import startContract from '../../snapshots/49393958032683cfd3feaae92b793e36e19a1cece228205b58d5e57eb243f457/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/76836359932dcee21593b080bb6f7e13cc9bedcadc939c23a0785fcb575e0ea2/contract';
import endContract from '../../snapshots/76836359932dcee21593b080bb6f7e13cc9bedcadc939c23a0785fcb575e0ea2/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Notification',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('dedupeKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('href', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isRead', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('INFO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.setNotNull({ schema: 'public', table: 'Company', column: 'userId' }),
      this.setNotNull({ schema: 'public', table: 'Contact', column: 'userId' }),
      this.setNotNull({ schema: 'public', table: 'Deal', column: 'userId' }),
      this.setNotNull({ schema: 'public', table: 'Lead', column: 'userId' }),
      this.addUnique({
        schema: 'public',
        table: 'Notification',
        constraint: 'Notification_dedupeKey_key',
        columns: ['dedupeKey'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Notification',
        index: 'Notification_userId_createdAt_idx_f726f04a',
        columns: ['userId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Notification',
        index: 'Notification_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Notification',
        index: 'Notification_userId_isRead_createdAt_idx_33778255',
        columns: ['userId', 'isRead', 'createdAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Notification',
        foreignKey: {
          name: 'Notification_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
