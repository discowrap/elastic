import {EngineResponse, JSONDefinition} from "@discowrap/core";
import {ElasticEngine} from "lib/ElasticEngine";

export class ElasticIndexTemplateDefinition extends JSONDefinition {
  constructor(name, template) {
    super(name, template);
  }

  /**
   * Index templates are deployed as compressed and escaped Mustache
   * to the elasticsearch cluster as stored scripts using the `putScript` API call
   * https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-scripting-using.html#modules-scripting-stored-scripts
   *
   * @param searchHost
   * @param name
   * @param replace
   */
  deploy(searchHost: string, name?: string, replace?: boolean): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).deployIndexTemplate(name || super.name(), this, replace)
  }

  isDeployed(searchHost: string, name?: string): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).indexTemplateIsDeployed(name || super.name());
  }

  delete(searchHost: string, name: string): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).deleteIndexTemplate(name)
  };

  static fromTemplate = ({ name, template }) => {
    return new ElasticIndexTemplateDefinition(name, template);
  }
}