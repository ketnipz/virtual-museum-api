const process = require('process');

const fastify = require('fastify')({ logger: true });
const { Sequelize } = require('sequelize');

const config = require('./server.config');
const initDbModels = require('./models/init-models');

fastify.register(require('./routes/search/search'));
fastify.register(require('./routes/image/image'));

const sequelize = new Sequelize(
  config.database.database, 
  config.database.user, 
  config.database.pass, {
    host: config.database.host,
    dialect: 'postgres',
    logging: msg => fastify.log.debug(msg)
  });

fastify.decorate('db', sequelize);
fastify.decorate('models', initDbModels(sequelize));

fastify.register(async (fastify) => {
  try {
    await fastify.db.authenticate();
    fastify.log.info('Connected to db successfully');
  } catch(err) {
    fastify.log.error('Unable to connect to db');
    process.exit(1);
  }
});

const start = async () => {
  try {
    await fastify.listen(8000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();