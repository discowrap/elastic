import {resolve} from 'path';
import ElasticProject from "lib/ElasticProject";
import {ElasticEngine} from "lib/ElasticEngine";

describe('The ElasticProject should', () => {


  it('locate engine setting definitions in a test project using the default ElasticProject ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const engineSettingPaths = project.projectMappingFor("cluster");

    const expected = {
      collar: {
        definition: expect.stringMatching(/testproject\/cluster\/collar.ts$/),
        install: expect.stringMatching(/testproject\/install\/cluster\/collar.json$/)
      }
    };

    return expect(engineSettingPaths).toMatchObject(expected);
  });


  it('locate query template definitions in a test project using the default ElasticProject ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const queryTemplatePaths = project.projectMappingFor("query");

    const expected = {
      q1: {
        definition: expect.stringMatching(/testproject\/query\/q1.ts$/),
        install: expect.stringMatching(/testproject\/install\/query\/q1.mustache$/)
      },
      q2: {
        definition: expect.stringMatching(/testproject\/query\/q2.js$/),
        install: expect.stringMatching(/testproject\/install\/query\/q2.mustache$/)
      }
    };

    return expect(queryTemplatePaths).toMatchObject(expected);
  });


  it('locate index template definitions in a test project using the default ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const indexTemplatePaths = project.projectMappingFor("index/template");

    const expected = {
      idxtmpl1: {
        definition: expect.stringMatching(/testproject\/index\/template\/idxtmpl1.ts$/),
        install: expect.stringMatching(/testproject\/install\/index\/template\/idxtmpl1.json$/)
      }
    };

    return expect(indexTemplatePaths).toMatchObject(expected);
  });


  it('locate index definitions in a test project using the default ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const indexDefinitionPaths = project.projectMappingFor("index");

    const expected = {
      idx1: {
        definition: expect.stringMatching(/testproject\/index\/idx1.ts$/),
        install: expect.stringMatching(/testproject\/install\/index\/idx1.json$/)
      }
    };

    return expect(indexDefinitionPaths).toMatchObject(expected);
  });


  it('locate featureset template definitions in a test project using the default ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const featuresetTemplatePaths = project.projectMappingFor("featureset");

    const expected = {
      fs1: {
        definition: expect.stringMatching(/testproject\/featureset\/fs1.ts$/),
        install: expect.stringMatching(/testproject\/install\/featureset\/fs1.mustache$/)
      },
      fs2: {
        definition: expect.stringMatching(/testproject\/featureset\/fs2.ts$/),
        install: expect.stringMatching(/testproject\/install\/featureset\/fs2.mustache$/)
      }
    };

    return expect(featuresetTemplatePaths).toMatchObject(expected);
  });


  it('locate and install all template definitions in a test project using the default ProjectStructure', async () => {
    const projectRoot = resolve("test/testproject");
    const installDir = "/tmp/install";
    const project = ElasticProject(projectRoot, installDir);

    const status = await project.install();

    // DEBUG:  Promises aren't resolved by the time status is written

    return expect(status).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/tmp\/install\/cluster\/collar.json: INSTALLED/),
        expect.stringMatching(/tmp\/install\/query\/q1.mustache: INSTALLED/),
        expect.stringMatching(/tmp\/install\/query\/q2.mustache: INSTALLATION FAILED/),
        expect.stringMatching(/tmp\/install\/index\/idx1.json: INSTALLED/),
        expect.stringMatching(/tmp\/install\/index\/template\/idxtmpl1.json: INSTALLED/),
        expect.stringMatching(/tmp\/install\/featureset\/fs1.mustache: INSTALLED/),
        expect.stringMatching(/tmp\/install\/featureset\/fs2.mustache: INSTALLATION FAILED/)
      ])
    );
  });


  it('deploy all template definitions in a test project using the default ProjectStructure', async () => {
    const projectRoot = resolve("test/testproject");
    const installDir = "/tmp/install";
    const project = ElasticProject(projectRoot, installDir);
    const searchHost = "http://localhost:9200";

    const status = await project.deploy(searchHost, true);

    return Promise.resolve(expect(status).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^collar: DEPLOYED/),
        expect.stringMatching(/^q1: DEPLOYED/),
        expect.stringMatching(/^q2: DEPLOYMENT FAILED/),
        expect.stringMatching(/^idx1: DEPLOYED/),
        expect.stringMatching(/^idxtmpl1: DEPLOYED/),
        expect.stringMatching(/^fs1: DEPLOYED/),
        expect.stringMatching(/^fs2: DEPLOYMENT FAILED/)
      ])
    )).then(() => {
      const engine = new ElasticEngine(searchHost);
      engine.deleteQueryTemplate("q1");
      engine.deleteIndexTemplate("idxtmpl1");
      engine.deleteIndex("idx1");
    });
  });

});
