const { Client } = require("@elastic/elasticsearch");

require("dotenv").config();

const elasticClient = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    apiKey: process.env.APIKEY,
  },
});

module.exports = elasticClient;