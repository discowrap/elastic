import {EngineResponse, Query} from "@discowrap/core";
import {MustacheTemplateDefinition} from "lib/MustacheTemplateDefinition";
import {ElasticEngine} from "lib/ElasticEngine";

export class ElasticQueryTemplateDefinition extends MustacheTemplateDefinition implements Query {
  constructor(name, template) {
    super(name, template);
  }

  /**
   * Query templates are deployed as compressed and escaped Mustache
   * to the elasticsearch cluster as stored scripts using the `putScript` API call
   * https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-scripting-using.html#modules-scripting-stored-scripts
   *
   * @param searchHost
   * @param name
   * @param replace
   */
  deploy(searchHost: string, name?: string, replace?: boolean): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).deployQueryTemplate(name || this.name(), this);
  }

  isDeployed(searchHost: string): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).queryTemplateIsDeployed(this.name());
  }

  static fromTemplate = ({ name, template }) => {
    return new ElasticQueryTemplateDefinition(name, template);
  }
}