#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/76836359932dcee21593b080bb6f7e13cc9bedcadc939c23a0785fcb575e0ea2/contract';
import endContract from '../../snapshots/76836359932dcee21593b080bb6f7e13cc9bedcadc939c23a0785fcb575e0ea2/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/91ee05abc751cbd906ea8d3522e2a8060ac10f13496c3a963acc5206fe48c488/contract';
import startContract from '../../snapshots/91ee05abc751cbd906ea8d3522e2a8060ac10f13496c3a963acc5206fe48c488/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setNotNull({ schema: 'public', table: 'Company', column: 'userId' }),
      this.setNotNull({ schema: 'public', table: 'Contact', column: 'userId' }),
      this.setNotNull({ schema: 'public', table: 'Deal', column: 'userId' }),
      this.setNotNull({ schema: 'public', table: 'Lead', column: 'userId' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
