import {ElasticIndexDefinition} from "lib/ElasticIndexDefinition";

module.exports = ElasticIndexDefinition.fromDefinition({
  name: "idx1",
  definition: {
    settings: {
      number_of_shards: 3,
      number_of_replicas: 2
    },
    mappings: {
      dynamic: "false",
      properties: {
        name: { type: "text" }
      }
    }
  }
});

