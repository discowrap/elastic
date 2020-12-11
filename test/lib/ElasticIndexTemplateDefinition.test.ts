import {successful} from "@discowrap/core";
import {ElasticIndexTemplateDefinition} from "lib/ElasticIndexTemplateDefinition";
import {ElasticEngine} from "lib/ElasticEngine";

describe('Index Templates', () => {
  it('can be checked, deployed, and cleaned up', () => {
    /* If this index class were code-generated
     * This file would be named `idx5.ts`
     *
     * The index template will be "installed" as `idx5.json`
     * The index template would be "deployed" as `index_idx5__<index-major>`
     * The index write alias would be `index_idx5__<index-major>_write
     * The index read alias would be `index_idx5__<index-major>_read
     * The indices themselves would follow `index_idx5__<index-major>-<index-minor>-000001`
     */
    const idx5 = ElasticIndexTemplateDefinition.fromTemplate({
      name: "idx5",
      template: {
        index_patterns: ["index_idx5__*"],
        settings: {
          number_of_shards: 5,
          number_of_replicas: 2
        }
      }
    });

    const searchHost = "http://localhost:9200";

    expect.assertions(4);

    return new ElasticEngine(searchHost).deleteIndexTemplate(idx5.name(), true)
      .then(() => idx5.deploy(searchHost, null, true))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => idx5.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => new ElasticEngine(searchHost).deleteIndexTemplate( idx5.name() ))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => idx5.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeFalsy());
  });
});
