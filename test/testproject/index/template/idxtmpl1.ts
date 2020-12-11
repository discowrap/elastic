import {ElasticIndexTemplateDefinition} from "lib/ElasticIndexTemplateDefinition";

module.exports = ElasticIndexTemplateDefinition.fromTemplate({
  name: "idxtmpl1",
  template: {
    index_patterns: ["foo-*"],
    settings: {
      number_of_shards: 5,
      number_of_replicas: 2
    }
  }
});

