#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/76836359932dcee21593b080bb6f7e13cc9bedcadc939c23a0785fcb575e0ea2/contract';
import startContract from '../../snapshots/76836359932dcee21593b080bb6f7e13cc9bedcadc939c23a0785fcb575e0ea2/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/91c3ad102310b5e00de9435c5b6ddd988b8046a020f11440b67718334a0c3252/contract';
import endContract from '../../snapshots/91c3ad102310b5e00de9435c5b6ddd988b8046a020f11440b67718334a0c3252/contract.json' with { type: 'json' };
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
        table: 'LeadAnswer',
        columns: [
          col('answer', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('leadId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('questionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'LeadQuestion',
        columns: [
          col('answerType', 'text', {
            notNull: true,
            default: lit('TEXT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('fieldKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('options', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('projectId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('question', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Project',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('createdById', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ProjectMember',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('projectId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Lead',
        column: col('projectId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'LeadAnswer',
        constraint: 'LeadAnswer_leadId_questionId_key',
        columns: ['leadId', 'questionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'LeadQuestion',
        constraint: 'LeadQuestion_projectId_fieldKey_key',
        columns: ['projectId', 'fieldKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Project',
        constraint: 'Project_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ProjectMember',
        constraint: 'ProjectMember_projectId_userId_key',
        columns: ['projectId', 'userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Lead',
        index: 'Lead_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LeadAnswer',
        index: 'LeadAnswer_leadId_idx_9113844c',
        columns: ['leadId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LeadAnswer',
        index: 'LeadAnswer_questionId_idx_fdb42076',
        columns: ['questionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LeadQuestion',
        index: 'LeadQuestion_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Project',
        index: 'Project_createdById_idx_8bf640ed',
        columns: ['createdById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectMember',
        index: 'ProjectMember_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectMember',
        index: 'ProjectMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LeadAnswer',
        foreignKey: {
          name: 'LeadAnswer_leadId_fkey',
          columns: ['leadId'],
          references: { schema: 'public', table: 'Lead', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LeadAnswer',
        foreignKey: {
          name: 'LeadAnswer_questionId_fkey',
          columns: ['questionId'],
          references: { schema: 'public', table: 'LeadQuestion', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LeadQuestion',
        foreignKey: {
          name: 'LeadQuestion_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Project',
        foreignKey: {
          name: 'Project_createdById_fkey',
          columns: ['createdById'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Lead',
        foreignKey: {
          name: 'Lead_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectMember',
        foreignKey: {
          name: 'ProjectMember_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectMember',
        foreignKey: {
          name: 'ProjectMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
