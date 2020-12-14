import axios from "axios";
import {Client, ClientOptions} from "@elastic/elasticsearch";
import {Engine, EngineResponse} from "@discowrap/core";
import {ElasticEngineResponse} from "lib/ElasticEngineResponse";
import {ElasticEngineSettingsDefinition} from "lib/ElasticEngineSettingsDefinition";
import {ElasticIndexDefinition} from "lib/ElasticIndexDefinition";
import {ElasticIndexTemplateDefinition} from "lib/ElasticIndexTemplateDefinition";
import {ElasticQueryTemplateDefinition} from "lib/ElasticQueryTemplateDefinition";
import {ElasticFeaturesetTemplateDefinition} from "lib/ElasticFeaturesetTemplateDefinition";


// This class should implement all of the rest server calls
// (Specialized Definition's should delegate here)
export class ElasticEngine implements Engine {
  _client: Client;
  _node: string;
  _opts: { [key: string]: any };

  constructor(node: string="http://localhost:9200", opts?: ClientOptions) {
    this._node = node;
    this._opts = opts;

    let clientOpts;

    if (!opts) {
      clientOpts = {node};
    } else if (!opts.node && !opts.nodes) { // opts is missing node, use node:
      clientOpts = {node, ...opts};
    } else { // just use opts (with node/nodes specified in opts)
      clientOpts = opts;
    }

    this._client = new Client(clientOpts);
  }

  client(): Client {
    return this._client;
  };

  async healthy(): Promise<EngineResponse> {
    return this._client.ping({}, {requestTimeout: 1000})
      .then(res => new ElasticEngineResponse(res))
      .catch(e => new ElasticEngineResponse({ body: e, statusCode: 0, headers: [], warnings: [], meta: [], success: false }))
  };

  /****************
   * CLUSTER
   ****************/
  async deploySettings(body): Promise<EngineResponse> {
    return this._client
      .cluster.putSettings({ body })
      .then(res => new ElasticEngineResponse(res));
  };

  async getSettings(): Promise<EngineResponse> {
    return this._client
      .cluster.getSettings({ flat_settings: true })
      .then(res => new ElasticEngineResponse(res));
  };

  /****************
   * FEATURESET
   ****************/
  private featureSetURLFor(featureSetName): string {
    return `${this._node}/_ltr/_featureset/${featureSetName}`;
  };

  // definition<T implements Transformable>
  async deployFeatureSet(name: string, definition: ElasticFeaturesetTemplateDefinition): Promise<EngineResponse> {
    if (!name || !definition) {
      return Promise.resolve(new ElasticEngineResponse({
        body: {},
        statusCode: "N/A",
        warnings: ["Missing featureSet name or definition in deployFeatureSet(name, definition)"],
        meta: {},
        headers: {},
        success: false
      }))
    }

    return definition.transform(true)
      .then(data => axios({
        method: 'post',
        url: this.featureSetURLFor(name),
        headers: {
          'Content-Type': 'application/json'
        },
        data
      }))
      .then(res => new ElasticEngineResponse({
        body: res.data,
        statusCode: res.status,
        warnings: [],
        meta: {},
        headers: res.headers,
        success: (res.data.result === "created" || res.data.result === "updated")
      }));
  }

  async featureSetIsDeployed(name: string): Promise<EngineResponse> {
    return axios({
      method: 'get',
      url: this.featureSetURLFor(name),
      validateStatus: () => true
    })
      .then(res => new ElasticEngineResponse({
        body: res.data,
        statusCode: res.status,
        warnings: [],
        meta: {},
        headers: res.headers,
        success: (res.data.found)
      }));
  };

  async deleteFeatureSet(name: string, ignoreMissing?: boolean): Promise<EngineResponse> {
    return axios({
      method: 'delete',
      url: this.featureSetURLFor(name),
      validateStatus: () => true
    }).then(res => new ElasticEngineResponse({
      body: res.data,
      statusCode: res.status,
      warnings: [],
      meta: {},
      headers: res.headers,
      success: (res.data.result === "deleted")
    })).catch(e => {
      if (ignoreMissing) {
        return new ElasticEngineResponse({
          body: {},
          statusCode: 404,
          warnings: [...e],
          meta: {},
          headers: {},
          success: true
        });
      } else {
          throw(e);
      }
    });
  };


  /****************
   * INDEX
   ****************/

  async deployIndex(indexName: string, definition: ElasticIndexDefinition): Promise<EngineResponse> {
    if (!(definition instanceof ElasticIndexDefinition)) {
      return Promise.reject(new ElasticEngineResponse({ body: {error: ""}, statusCode: 0, headers: [], warnings: [], meta: [], success: false }))
    }

    return definition.transform(true).then(body =>
      this._client.indices.create({ index: indexName, body }))
      .then(res => new ElasticEngineResponse(res))
      .catch(e => new ElasticEngineResponse({ body: e, statusCode: 0, headers: [], warnings: [], meta: [], success: false }))
  }

  async indexIsDeployed(indexName: string): Promise<EngineResponse> {
    return this._client.indices.exists({
      index: indexName
    })
      .then(res => new ElasticEngineResponse({
        ...res,
        success: (res.body.found)
      }))
  }

  async deleteIndex(indexName: string, ignoreMissing?: boolean): Promise<EngineResponse> {
    return this._client.indices.delete({
      index: indexName,
      ignore_unavailable: ignoreMissing || false
    })
      .then(res => new ElasticEngineResponse(res));
  }

  async settingsAreDeployed(settings: ElasticEngineSettingsDefinition): Promise<EngineResponse> {
    // TODO:  revisit this... Necessary?  It's difficult to implement
    return Promise.resolve(new ElasticEngineResponse({ body: {}, statusCode: 0, headers: [], warnings: [], meta: [], success: false }));
  }



  /****************
   * INDEX TEMPLATE
   ****************/
  async deployIndexTemplate(name: string, definition: ElasticIndexTemplateDefinition, create: boolean): Promise<EngineResponse> {
    return definition.transform(true).then(body =>
      this._client.indices
        .putTemplate({
          name: name,
          body,
          create
        }))
      .then(res => new ElasticEngineResponse(res));
  }

  async indexTemplateIsDeployed(name: string): Promise<EngineResponse> {
    return this._client.indices
      .existsTemplate({ name })
      .then(res => new ElasticEngineResponse({
        ...res,
        success: (res.body.found)
      }));
  }

  async deleteIndexTemplate(name: string, ignoreMissing?: boolean): Promise<EngineResponse> {
    return this._client
      .indices.deleteTemplate({ name })
      .then(res => new ElasticEngineResponse(res))
      .catch(e => {
        if (ignoreMissing) {
          return new ElasticEngineResponse({
            body: {},
            statusCode: 404,
            warnings: {...e},
            meta: {},
            headers: {},
            success: true
          });
        } else {
          throw(e);
        }
      });
  }


  /****************
   * QUERY TEMPLATE
   ****************/
  async deployQueryTemplate(name: string, definition: ElasticQueryTemplateDefinition): Promise<EngineResponse> {
    return definition.transform(true).then(source =>
      this._client
        .putScript({
          id: name,
          body: {
            script: {
              lang: "mustache",
              source
            }
          }
        })
        .then(res => new ElasticEngineResponse(res)));
  }

  async queryTemplateIsDeployed(name: string): Promise<EngineResponse> {
    return this._client
      .getScript({
        id: name
      }, {
        ignore: [404]
      })
      .then(res => new ElasticEngineResponse({
        ...res,
        success: (res.body.found)
      }));
  }

  async deleteQueryTemplate(name: string, ignoreMissing?: boolean): Promise<EngineResponse> {
    return this._client
      .deleteScript({ id: name })
      .then(res => new ElasticEngineResponse(res))
      .catch(e => {
          if (ignoreMissing) {
            return new ElasticEngineResponse({
              body: {},
              statusCode: 404,
              warnings: {...e},
              meta: {},
              headers: {},
              success: true
            });
          } else {
            throw(e);
          }
        });
  }

  /****************
   * TEST SUPPORT
   ****************/
  async loadDocuments(indexName: string,
                documents: { [key: string]: object }): Promise<EngineResponse> {
    return this._client.bulk({
      body: transformDocumentsToBulk(documents, indexName),
      refresh: "true",
    })
      .then(res => new ElasticEngineResponse(res))
      .catch(e => new ElasticEngineResponse({ body: e, statusCode: 0, headers: [], warnings: [], meta: [], success: false }))
  }

  async search(indexName: string,
         query: ElasticQueryTemplateDefinition,
         parameters: { [key: string]: any },
         verbose: boolean): Promise<EngineResponse> {
    return query.transform(true)
      .then(transformed => {
        const body = {
            source: transformed,
            params: parameters,
        };

        if (verbose) {
          console.log(JSON.stringify(body, null, 2));
        }
        return this._client.searchTemplate({
          index: indexName,
          body
        }).then(res => new ElasticEngineResponse(res));
      })

  }
}


function transformDocumentsToBulk(documents, indexName) {
  return Object.keys(documents)
    .reduce((acc, key) => [
      ...acc,
      {
        index: {
          _index: indexName,
          _type: '_doc',
          _id: String(key)
        },
      },
      documents[key]
    ], []);
}

export function UNSUPPORTED_REQUEST(code, message) {
  return new ElasticEngineResponse({
    body: {},
    statusCode: code,
    warnings: {...message},
    meta: {},
    headers: {},
    success: true
  });
}