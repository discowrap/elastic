import {EngineResponse, JSONDefinition, Query} from "@discowrap/core";
import {UNSUPPORTED_REQUEST} from "lib/ElasticEngine";

// TODO:  Replace fixed deploy behavior in Definition abstract with interface Deployable
export class ElasticQuepidQueryDefinition extends JSONDefinition implements Query {
  constructor(name, definition) {
    super(name, definition);
  }

  static fromDefinition = ({ name, definition }) => {
    return new ElasticQuepidQueryDefinition(name, definition);
  };

  deploy(searchHost: string, name?: string, replace?: boolean): Promise<EngineResponse> {
    return Promise.resolve(UNSUPPORTED_REQUEST(415, `${this.name()} not processed for deployment as Quepid queries deploy manually.`));
  }
  isDeployed(searchHost: string, name?: string): Promise<EngineResponse> {
    return Promise.resolve(UNSUPPORTED_REQUEST(415, `${this.name()} not processed for deployment as Quepid queries deploy manually.`));
  }
}