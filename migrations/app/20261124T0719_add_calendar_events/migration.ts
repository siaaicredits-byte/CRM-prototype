#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1572d517ed9ba96753a004be720fd77121963a1444295b2ca202ea5742995de1/contract';
import startContract from '../../snapshots/1572d517ed9ba96753a004be720fd77121963a1444295b2ca202ea5742995de1/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/49393958032683cfd3feaae92b793e36e19a1cece228205b58d5e57eb243f457/contract';
import endContract from '../../snapshots/49393958032683cfd3feaae92b793e36e19a1cece228205b58d5e57eb243f457/contract.json' with { type: 'json' };
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
        table: 'CalendarEvent',
        columns: [
          col('companyId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('contactId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('dealId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('endAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('leadId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('location', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('startAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('SCHEDULED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('MEETING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CalendarEvent',
        index: 'CalendarEvent_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CalendarEvent',
        index: 'CalendarEvent_contactId_idx_ec98db2a',
        columns: ['contactId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CalendarEvent',
        index: 'CalendarEvent_dealId_idx_3e3b3068',
        columns: ['dealId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CalendarEvent',
        index: 'CalendarEvent_leadId_idx_9113844c',
        columns: ['leadId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CalendarEvent',
        index: 'CalendarEvent_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'CalendarEvent',
        foreignKey: {
          name: 'CalendarEvent_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'CalendarEvent',
        foreignKey: {
          name: 'CalendarEvent_leadId_fkey',
          columns: ['leadId'],
          references: { schema: 'public', table: 'Lead', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'CalendarEvent',
        foreignKey: {
          name: 'CalendarEvent_contactId_fkey',
          columns: ['contactId'],
          references: { schema: 'public', table: 'Contact', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'CalendarEvent',
        foreignKey: {
          name: 'CalendarEvent_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'Company', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'CalendarEvent',
        foreignKey: {
          name: 'CalendarEvent_dealId_fkey',
          columns: ['dealId'],
          references: { schema: 'public', table: 'Deal', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
