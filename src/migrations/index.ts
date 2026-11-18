import * as migration_20261117_072144 from './20261117_072144';

import * as migration_20261117_074800 from './20261117_074800';

import * as migration_20261118_200729 from './20261118_200729';

export const migrations = [
  {
    up: migration_20261117_072144.up,
    down: migration_20261117_072144.down,
    name: '20261117_072144'
  },
  { up: migration_20261117_074800.up, down: migration_20261117_074800.down, name: '20261117_074800' },
  { up: migration_20261118_200729.up, down: migration_20261118_200729.down, name: '20261118_200729' },
];
