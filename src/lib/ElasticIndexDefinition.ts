import {EngineResponse, JSONDefinition} from "@discowrap/core";
import {ElasticEngine} from "lib/ElasticEngine";


export class ElasticIndexDefinition extends JSONDefinition {
  constructor(name, definition) {
    super(name, definition);
  }

  /**
   * Index definitions are deployed
   * to the elasticsearch cluster using the `indices.create` API call
   * https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_indices_create
   *
   * @param searchHost
   * @param name the name for the index when deployed
   */
  deploy(searchHost: string, name?: string): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).deployIndex(
      name || super.name(),
      this
    );
  }

  isDeployed(searchHost: string, name?: string): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).indexIsDeployed(
      name || super.name()
    );
  }

  delete(searchHost: string, name?: string, ignoreMissing?: boolean): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).deleteIndex(
      name || super.name(),
      ignoreMissing || false
    );
  };

  static fromDefinition = ({ name, definition }) => {
    return new ElasticIndexDefinition(name, definition);
  }
}

