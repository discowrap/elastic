import {ElasticEngineSettingsDefinition} from "lib/ElasticEngineSettingsDefinition";

module.exports = ElasticEngineSettingsDefinition.fromDefinition({
  name: "collar",
  definition: {
    persistent : {
      "indices.recovery.max_bytes_per_sec" : "10mb"
    }
  }
});
