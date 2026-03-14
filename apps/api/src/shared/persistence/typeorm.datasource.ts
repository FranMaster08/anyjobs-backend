import { DataSource } from 'typeorm';
import { configuration } from '../../config/configuration';
import { buildDataSourceOptions } from './typeorm.options';

const config = configuration();
const options = buildDataSourceOptions(config.database);

export default new DataSource(options);

