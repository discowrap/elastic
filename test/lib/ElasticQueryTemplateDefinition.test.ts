import {ElasticQueryTemplateDefinition} from "lib/ElasticQueryTemplateDefinition";
import {successful} from '@discowrap/core';
import {ElasticEngine} from "lib/ElasticEngine";

describe('Query Templates', () => {
  it('can be checked, deployed, and cleaned up', () => {
    const q3 = ElasticQueryTemplateDefinition.fromTemplate({
      name: "q3",
      template: {
        query: {
          match_none: {}
        }
      }
    });

    const searchHost = "http://localhost:9200";

    expect.assertions(4);

    return new ElasticEngine(searchHost).deleteQueryTemplate(q3.name(), true)
      .then(() => q3.deploy(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => q3.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => new ElasticEngine(searchHost).deleteQueryTemplate( q3.name() ))
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => q3.isDeployed(searchHost))
      .then(res => expect(successful(res.statusCode)).toBeFalsy());
  });
});
