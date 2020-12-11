import {resolve} from 'path';
import {Project, ProjectStructure} from "@discowrap/core";
import {ElasticEngine} from "lib/ElasticEngine";

const fooeyFidgetProjectStructure = new ProjectStructure({
  "fidget": {
    "src": {
      "dir": "query",
      "extension": ["ts", "js"]
    },
    "install": {
      "dir": "fidget",
      "extension": ".fooey"
    },
    "deploy": {
      "name_prefix": "fidget_"
    }
  }});

describe('The Project should', () => {
  it('locate fidget definitions in a test project using a custom ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = new Project(projectRoot, fooeyFidgetProjectStructure);

    const fidgetPaths = project.projectMappingFor("fidget");

    const expected = {
      q1: {
        definition: expect.stringMatching(/testproject\/query\/q1.ts$/),
        install: expect.stringMatching(/testproject\/install\/fidget\/q1.fooey$/)
      },
      q2: {
        definition: expect.stringMatching(/testproject\/query\/q2.js$/),
        install: expect.stringMatching(/testproject\/install\/fidget\/q2.fooey$/)
      }
    };

    return expect(fidgetPaths).toMatchObject(expected);
  });

  it('locate and install all fidget definitions in a test project using a custom ProjectStructure', async () => {
    const projectRoot = resolve("test/testproject");
    const installDir = "/tmp/install";
    const project = new Project(
      projectRoot,
      fooeyFidgetProjectStructure,
      installDir
    );

    const status = await project.install();

    return expect(status).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/tmp\/install\/fidget\/q1.fooey: INSTALLED/),
        expect.stringMatching(/tmp\/install\/fidget\/q2.fooey: INSTALLATION FAILED/)
      ])
    );
  });

  it('deploy all fidget definitions in a test project using a custom ProjectStructure', async () => {
    const projectRoot = resolve("test/testproject");
    const installDir = "/tmp/install";
    const project = new Project(projectRoot, fooeyFidgetProjectStructure, installDir);
    const searchHost = "http://localhost:9200";

    const status = await project.deploy(searchHost, true);

    return Promise.resolve(expect(status).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^q1: DEPLOYED/),
        expect.stringMatching(/^q2: DEPLOYMENT FAILED/)
      ])
    )).then(() => {
      new ElasticEngine(searchHost).deleteQueryTemplate("q1" );
    });
  });

});
