import { generateNamespace } from '@gql2ts/from-schema';
import * as fs from 'fs';
import * as path from 'path';
import { generateSchema } from '../utils/generateSchema';

fs.writeFile(
  path.join(__dirname, '../types/schema.d.ts'),
  generateNamespace('GQL', generateSchema()),
  e => {
    console.log(e);
  }
);
