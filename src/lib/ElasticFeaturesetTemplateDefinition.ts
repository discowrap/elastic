import {EngineResponse} from "@discowrap/core";
import {MustacheTemplateDefinition} from "lib/MustacheTemplateDefinition";
import {ElasticEngine} from "lib/ElasticEngine";

export class ElasticFeaturesetTemplateDefinition extends MustacheTemplateDefinition {
  constructor(name, template) {
    super(name, template);
  }

  /**
   * Featureset templates are deployed as compressed and escaped Mustache
   * to the elasticsearch cluster as stored scripts using the `putScript` API call
   * https://www.elastic.co/guide/en/elasticsearch/reference/7.x/modules-scripting-using.html#modules-scripting-stored-scripts
   *
   * @param searchHost
   * @param name
   * @param replace - Overwrites existing definitions on cluster if true.
   */
  deploy(searchHost: string, name?: string, replace?: boolean): Promise<EngineResponse> {
    // When we push this script into the cluster we will name it using the project convention.
    return new ElasticEngine(searchHost).deployFeatureSet( name || this.name(), this);
  }

  isDeployed(searchHost: string, name?: string): Promise<EngineResponse> {
    return new ElasticEngine(searchHost).featureSetIsDeployed(name || this.name());
  }

  static fromTemplate = ({ name, template }) => {
    return new ElasticFeaturesetTemplateDefinition(name, template);
  }
}



