import {ElasticFeaturesetTemplateDefinition} from "lib/ElasticFeaturesetTemplateDefinition";

module.exports = ElasticFeaturesetTemplateDefinition.fromTemplate({
  name: "fs1",
  template: {
    featureset: {
      features: [
        {
          name: "foo-finder",
          params: [],
          template: {
            match: {
              id: "foo"
            }
          }
        }
      ]
    }
  }
});
