import {ElasticFeaturesetTemplateDefinition} from "lib/ElasticFeaturesetTemplateDefinition";
import {ElasticEngine} from "lib/ElasticEngine";
import {successful} from "@discowrap/core";

describe('Featureset Templates', () => {
  it('can be checked, deployed, and cleaned up', () => {

    /* If this index class were code-generated
     * This file would be named `fs3.ts`
     *
     * The featureset template will be "installed" as `fs3.mustache`
     * The featureset template would be "deployed" as `featureset_fs3__<version-scheme>`
     */
    const fs3 = ElasticFeaturesetTemplateDefinition.fromTemplate({
      name: "fs3",
      template: {
        featureset: {
          features: [
            {
              name: "title_query",
              params: [
                "keywords"
              ],
              template_language: "mustache",
              template: {
                match: {
                  title: "{{keywords}}"
                }
              }
            }
          ]
        }
      }
    });

    const searchHost = "http://localhost:9200";

    expect.assertions(4);

    return new ElasticEngine(searchHost).deleteFeatureSet(fs3.name())
      .then(() => fs3.deploy(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => fs3.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => new ElasticEngine(searchHost).deleteFeatureSet(fs3.name()))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => fs3.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeFalsy());
  });

});
