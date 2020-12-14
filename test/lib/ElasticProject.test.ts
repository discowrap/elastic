import {resolve} from 'path';
import ElasticProject from "lib/ElasticProject";
import {ElasticEngine} from "lib/ElasticEngine";
import index from "typescript-transform-paths";

describe('The ElasticProject should', () => {


  it('locate engine setting definitions in a test project using the default ElasticProject ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const engineSettingPaths = project.definitionDescriptorsFor("cluster");

    expect(engineSettingPaths[0].definitionName()).toBe("collar");
    expect(engineSettingPaths[0].definitionPath()).toEqual(expect.stringMatching(/testproject\/cluster\/collar.ts$/));
    expect(engineSettingPaths[0].installPath()).toEqual(expect.stringMatching(/testproject\/install\/cluster\/collar.json$/));
    expect(engineSettingPaths[0].deployedName()).toEqual("setting_collar");
  });


  it('locate query template definitions in a test project using the default ElasticProject ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const definitionDescriptors = project.definitionDescriptorsFor("query");
    const serialization = definitionDescriptors.map(dd => dd.serialize());

    const expected = [
      {
        definitionName: "q1",
        definitionPath: expect.stringMatching(/testproject\/query\/q1.ts$/),
        installPath: expect.stringMatching(/testproject\/install\/query\/q1.mustache$/),
        deployedName: "query_q1"
      },
      {
        definitionName: "q2",
        definitionPath: expect.stringMatching(/testproject\/query\/q2.js$/),
        installPath: expect.stringMatching(/testproject\/install\/query\/q2.mustache$/),
        deployedName: "query_q2"
      }
    ];

    return expect(serialization).toMatchObject(expected);
  });


  it('locate index template definitions in a test project using the default ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const definitionDescriptors = project.definitionDescriptorsFor("index/template");
    const serialization = definitionDescriptors.map(dd => dd.serialize());

    const expected = [
      {
        definitionName: "idxtmpl1",
        definitionPath: expect.stringMatching(/testproject\/index\/template\/idxtmpl1.ts$/),
        installPath: expect.stringMatching(/testproject\/install\/index\/template\/idxtmpl1.json$/),
        deployedName: "indext_idxtmpl1"
      }
    ];

    return expect(serialization).toMatchObject(expected);
  });


  it('locate index definitions in a test project using the default ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const definitionDescriptors = project.definitionDescriptorsFor("index");
    const serialization = definitionDescriptors.map(dd => dd.serialize());

    const expected = [
      {
        definitionName: "idx1",
        definitionPath: expect.stringMatching(/testproject\/index\/idx1.ts$/),
        installPath: expect.stringMatching(/testproject\/install\/index\/idx1.json$/),
        deployedName: "index_idx1"
      }
    ];

    return expect(serialization).toMatchObject(expected);
  });


  it('locate featureset template definitions in a test project using the default ProjectStructure', () => {
    const projectRoot = resolve("test/testproject");
    const project = ElasticProject(projectRoot);

    const definitionDescriptors = project.definitionDescriptorsFor("featureset");
    const serialization = definitionDescriptors.map(dd => dd.serialize());

    const expected = [
      {
        definitionName: "fs1",
        definitionPath: expect.stringMatching(/testproject\/featureset\/fs1.ts$/),
        installPath: expect.stringMatching(/testproject\/install\/featureset\/fs1.mustache$/),
        deployedName: "featureset_fs1"
      },
      {
        definitionName: "fs2",
        definitionPath: expect.stringMatching(/testproject\/featureset\/fs2.ts$/),
        installPath: expect.stringMatching(/testproject\/install\/featureset\/fs2.mustache$/),
        deployedName: "featureset_fs2"
      }
    ];

    return expect(serialization).toMatchObject(expected);
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
        expect.stringMatching(/tmp\/install\/query\/quepid\/qq.json: INSTALLED/),
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
        expect.stringMatching(/^setting_collar: DEPLOYED/),
        expect.stringMatching(/^query_q1: DEPLOYED/),
        expect.stringMatching(/^query_q2: DEPLOYMENT FAILED/),
        expect.stringMatching(/^quepid_qq: DEPLOYED/), // TODO:  Change to NOT DEPLOYED in Project
        expect.stringMatching(/^index_idx1: DEPLOYED/),
        expect.stringMatching(/^indext_idxtmpl1: DEPLOYED/),
        expect.stringMatching(/^featureset_fs1: DEPLOYED/),
        expect.stringMatching(/^featureset_fs2: DEPLOYMENT FAILED/)
      ])
    )).then(() => {
      const engine = new ElasticEngine(searchHost);
      engine.deleteQueryTemplate("q1");
      engine.deleteIndexTemplate("idxtmpl1");
      engine.deleteIndex("idx1");
    });
  });

});
