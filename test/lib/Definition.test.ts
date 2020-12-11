import {existsSync, unlinkSync} from 'fs';
import {ElasticQueryTemplateDefinition} from "lib/ElasticQueryTemplateDefinition";

describe('The Definition should', () => {

  it('install a template into a directory', async () => {

    const definition =  ElasticQueryTemplateDefinition.fromTemplate({
      name: "q1",
      template: {
        query: {
          match_all: {}
        }
      }
    });

    const installPath = "/tmp/q1.mustache";
    const installed = await definition.install(installPath);
    const expected = existsSync(installed);
    unlinkSync(installPath);

    return expect(expected).toBeTruthy()
  });


  //successfully using the DefinitionPaths defined by the Project

});
