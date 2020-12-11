import {ElasticQueryTemplateDefinition} from "lib/ElasticQueryTemplateDefinition";

/* If this query  were code-generated
 * This file would be named `q1.ts`
 *
 * The query template will be "installed" as `q1.mustache`
 * The query template would be "deployed" as `query_q1__<index-major>-<index-minor>-<query-patch>`
 */

module.exports = ElasticQueryTemplateDefinition.fromTemplate({
  name: "q1",
  template: {
    query: {
      match_all: {}
    }
  }
});

