import {successful} from "../../../core/src/lib/EngineResponse";
import {ElasticIndexDefinition} from "lib/ElasticIndexDefinition";

describe('Index Definitions', () => {
  it('can be checked, deployed, and cleaned up', () => {
    /* If this index class were code-generated
     * This file would be named `idx5.ts`
     *
     * The index definition will be "installed" as `idx5.json`
     * The index would be "deployed" as `index_idx5__<index-major>_<index-minor>`
     * The index write alias would be `index_idx5__<index-major>_write
     * The index read alias would be `index_idx5__<index-major>_read
     */
    const idx5 = ElasticIndexDefinition.fromDefinition({
      name: "idx5",
      definition: {
        settings: {
          number_of_shards: 5,
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

    const searchHost = "http://localhost:9200";

    expect.assertions(4);



    return idx5.delete(searchHost, null, true)
      .then(() => idx5.deploy(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => idx5.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => idx5.delete(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => idx5.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeFalsy());
  });
});
