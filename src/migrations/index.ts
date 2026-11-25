import * as migration_20261125_000001 from './20261125_000001';
import * as migration_20261117_072144 from './20261117_072144';
import * as migration_20261117_074800 from './20261117_074800';
import * as migration_20261118_200729 from './20261118_200729';
import * as migration_20261122_131710 from './20261122_131710';

export const migrations = [
  {
    up: migration_20261117_072144.up,
    down: migration_20261117_072144.down,
    name: '20261117_072144',
  },
  {
    up: migration_20261117_074800.up,
    down: migration_20261117_074800.down,
    name: '20261117_074800',
  },
  {
    up: migration_20261118_200729.up,
    down: migration_20261118_200729.down,
    name: '20261118_200729',
  },
  {
    up: migration_20261122_131710.up,
    down: migration_20261122_131710.down,
    name: '20261122_131710'
  },
  {
    up: migration_20261125_000001.up,
    down: migration_20261125_000001.down,
    name: '20261125_000001',
  },
];
