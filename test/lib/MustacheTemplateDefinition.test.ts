import {ElasticQueryTemplateDefinition} from "lib/ElasticQueryTemplateDefinition";
//import {wax, compressMustache} from "lib/StacheWax";
const {wax, compressMustache} = require("lib/StacheWax");

describe('Mustache Templates', () => {
  it('encoding mustache-conditional block in json', () => {
    const testTemplate = ElasticQueryTemplateDefinition.fromTemplate({
      name: "test",
      template: {
        query: {
          bool: {
            filter: [wax.if({
              param: "cnd",
              value: { match_all: {} },
              otherwise: { match_none: {} }
            })]
          }
        }
      }
    });

    const expected = `{ 
      \"query\": { 
        \"bool\": { 
          \"filter\": [ 
            {{#cnd}}{ \"match_all\": {} }{{/cnd}}{{^cnd}}{ \"match_none\": {} }{{/cnd}} 
          ] 
        } 
      } 
    }`;

    return expect(testTemplate.transform(true)).resolves.toEqual(compressMustache(expected))
  });

  it('encoding mustache-conditional key:value addition to object in json', () => {
    const obj = {
      foo: {}
    };

    const testTemplate = ElasticQueryTemplateDefinition.fromTemplate({
      name: "test",
      template: wax.addKeyIf({
        param: "bar",
        obj,
        key: "baz",
        value: "biz"
      })
    });

    const expected = `{ 
      \"foo\": {}, 
      {{#bar}} \"baz\": \"biz\", {{/bar}}
     }`;

    return expect(testTemplate.transform(true)).resolves.toEqual(compressMustache(expected));
  });


  // TODO: test
  it.skip('encoding unquoted {{#toJson}} element in json', () => {
    return expect(false).toBeTruthy();
  });

});
