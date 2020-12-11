import {ElasticIndexDefinition} from "lib/ElasticIndexDefinition";
import {ElasticQueryTemplateDefinition} from "lib/ElasticQueryTemplateDefinition";
import {ElasticIntegrationTest} from "lib/ElasticIntegrationTest";
import {ElasticEngine} from "lib/ElasticEngine";
import {ElasticFeaturesetTemplateDefinition} from "lib/ElasticFeaturesetTemplateDefinition";

describe('Integration Tests', () => {
  it('run and validate', () => {

    const index = ElasticIndexDefinition.fromDefinition({
      name: "stoogeStore",
      definition: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0
        },
        mappings: {
          dynamic: "false",
          properties: {
            name: {type: "text"}
          }
        }
      }
    });

    const documents = {
      "123": {name: "Larry Fine"},
      "456": {name: "Curly Howard"},
      "789": {name: "Moe Howard"}
    };

    const queryTemplate = ElasticQueryTemplateDefinition.fromTemplate({
      name: "query",
      template: {
        query: {
          match: {
            name: "{{keywords}}"
          }
        }
      }
    });

    const featureSet = ElasticFeaturesetTemplateDefinition.fromTemplate({
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

    const engine = new ElasticEngine("http://localhost:9200");

    const test = new ElasticIntegrationTest({ engine, index, documents, queryTemplate, featureSets: [featureSet] });

    expect.assertions(19);

    // test run method
    return test.run(test => test.search({keywords: "howard"})
      .then(r => expect(r.results().containUnorderedSubset(["456", "789"])).toBeTruthy())
    )

      .then(() =>
    // test runAll method
      test.runAll([
        test => test.search({keywords: "howard"})
          .then(r => {  // ## Some issue with SearchResults vs ElasticSearchResults

            // Validate (subset) test (results: "456", "789")
            expect(r.results().containUnorderedSubset(["123", "456", "789"])).toBeFalsy();
            expect(r.results().containUnorderedSubset(["456", "789"])).toBeTruthy();
            expect(r.results().containUnorderedSubset(["789", "456"])).toBeTruthy();
            expect(r.results().containUnorderedSubset(["456"])).toBeTruthy();
            // Validate (equality) test (results: "456", "789")
            expect(r.results().matchUnordered(["456"])).toBeFalsy();
            expect(r.results().matchUnordered(["456", "789"])).toBeTruthy();
            expect(r.results().matchUnordered(["789", "456"])).toBeTruthy();
            expect(r.results().matchOrdered(["456"])).toBeFalsy();
            expect(r.results().matchOrdered(["456", "789"])).toBeTruthy();
            expect(r.results().matchOrdered(["789", "456"])).toBeFalsy();
          }),
        test => test.search({keywords: "moe"})
          .then(r => {
            expect(r.results().matchUnordered(["456"])).toBeFalsy();
            expect(r.results().matchUnordered(["789"])).toBeTruthy();
            expect(r.results().matchOrdered(["456"])).toBeFalsy();
            expect(r.results().matchOrdered(["789"])).toBeTruthy();
          })
      ]))

      .then(() =>
        // test runCross method
        test.runCross([queryTemplate, queryTemplate], [
          (test, query) => test.searchWithQuery(query, {keywords: "howard"}, false)
            .then(r => {
              expect(r.results().containUnorderedSubset(["123", "456", "789"])).toBeFalsy();
              expect(r.results().containUnorderedSubset(["456", "789"])).toBeTruthy()
            })
        ])
      )
  });
});
