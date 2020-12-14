import {ElasticQuepidQueryDefinition} from "lib/tools/ElasticQuepidQueryDefinition";

module.exports = ElasticQuepidQueryDefinition.fromDefinition({
  name: "qq",
  definition: {
    query: {
      match: {
        "name": "#$query##"
      }
    }
  }
});
