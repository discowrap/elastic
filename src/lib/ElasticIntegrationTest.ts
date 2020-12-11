import {EngineResponse, IntegrationTest} from "@discowrap/core";
import {ElasticIndexDefinition} from "lib/ElasticIndexDefinition";
import {ElasticQueryTemplateDefinition} from "lib/ElasticQueryTemplateDefinition";
import {ElasticFeaturesetTemplateDefinition} from "lib/ElasticFeaturesetTemplateDefinition";
import {ElasticEngine} from "lib/ElasticEngine";

export class ElasticIntegrationTest extends IntegrationTest {
  private readonly _engine: ElasticEngine;
  private readonly _index: ElasticIndexDefinition;
  private readonly _documents: { [key: string]: object };
  private readonly _queryTemplate: ElasticQueryTemplateDefinition;
  private readonly _featureSets: ElasticFeaturesetTemplateDefinition[];

  constructor({ engine, index, documents, queryTemplate, featureSets }: { engine, index, documents, queryTemplate, featureSets? }) {
    super();
    this._engine = engine;
    this._index = index;
    this._documents = documents;
    this._queryTemplate = queryTemplate;
    this._featureSets = featureSets || [];
  }


  async setup() {
    // check engine
    const health = await this._engine.healthy();
    if (!health.success) {
      return Promise.reject("Cannot run test:  Engine is down");
    }

    // Create index (with this._testIndexName and this._index definition)
    const deployIndexResponse = await this._engine.deployIndex(this._testIndexName, this._index);
    if (!deployIndexResponse.success) {
      return Promise.reject(`Cannot run test:  Failed to deploy index ${this._testIndexName} for ${this._index.name()}.`);
    }

    console.log(`Set up ${this._testIndexName}`);

    // Load documents (this._documents)
    const loadDocumentsResponse = await this._engine.loadDocuments(this._testIndexName, this._documents);
    if (!loadDocumentsResponse.success) {
      return Promise.reject(`Cannot run test:  Failed to load documents ${this._documents} for ${this._index.name()}.`);
    }

    console.log(`Deploying featuresets ${this._testIndexName}`);

    // Store featuresets
    const proms = this._featureSets
      .reduce((acc, fs) =>
        [...acc, this._engine.deployFeatureSet(fs.name(), fs)], []);

    return Promise.all(proms)
      /*
      .then(statuses => {
        for (status in statuses) {
          if (!status.success) {
            return Promise.reject(`Cannot run test:  Failed to deploy featureset ${fs.name()} for ${this._index.name()}.`);
          }
        }
      })*/
      .then(() => {
        return Promise.resolve(this);
      });
  }

  async search(parameters: { [key: string]: any},  verbose?: boolean) : Promise<EngineResponse> {
    return this._engine.search(this._testIndexName, this._queryTemplate, parameters, verbose);
  }

  async searchWithQuery(queryTemplate: ElasticQueryTemplateDefinition, parameters: { [key: string]: any}, verbose: boolean) : Promise<EngineResponse> {
    return this._engine.search(this._testIndexName, queryTemplate, parameters, verbose);
  }

  async searchWithTemplate(parameters: { [key: string]: any},  queryTemplate: ElasticQueryTemplateDefinition, verbose?: boolean) : Promise<EngineResponse> {
    return this._engine.search(this._testIndexName, queryTemplate, parameters, verbose);
  }

  async teardown() : Promise<EngineResponse> {
    console.log(`Tearing down ${this._testIndexName}`);
    return this._engine.deleteIndex(this._testIndexName, true);
  }
}
