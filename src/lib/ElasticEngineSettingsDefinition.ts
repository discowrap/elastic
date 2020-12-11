import {EngineResponse, JSONDefinition} from "@discowrap/core";
import {ElasticEngine} from "lib/ElasticEngine";


export class ElasticEngineSettingsDefinition extends JSONDefinition {
  constructor(name, definition) {
    super(name, definition);
  }

  /**
   * Engine settings are deployed
   * to the elasticsearch cluster using the `cluster.putSettings` API call
   * https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_cluster_getsettings
   *
   * @param searchHost
   */
  deploy(searchHost: string): Promise<EngineResponse> {
    return super.transform(true)
      .then(body => new ElasticEngine(searchHost).deploySettings(body));
  }

  /**
   * Verify that the definition is deployed
   * @param searchHost
   * @param name - The name of the definition to be deployed
   */
  isDeployed(searchHost: string, name?: string): Promise<EngineResponse> {
    // TODO:  revisit this ... difficult to implement ... and "name" unused.  Move to interfaces (Deployable, Verifiable, Undeployable)
    return new ElasticEngine(searchHost).settingsAreDeployed(this);
  }

  static fromDefinition = ({ name, definition }) => {
    return new ElasticEngineSettingsDefinition(name, definition);
  }
}

