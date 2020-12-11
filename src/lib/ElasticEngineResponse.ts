import {EngineResponse, SearchResults, successful} from "@discowrap/core";
import {ElasticSearchResults} from "lib/ElasticSearchResults";

export class ElasticEngineResponse extends EngineResponse {
  elasticResponse: object;

  constructor({ body = {}, statusCode, headers, warnings, meta, success = successful(statusCode) }) {
    super({
      success,
      statusCode,
      message: (warnings && warnings.length) ? warnings[0] : "",
      body
    });

    this.elasticResponse = { body, statusCode, headers, warnings, meta };
  }

  results(): SearchResults {
    return new ElasticSearchResults(this.elasticResponse["body"]);
  }
}


export const elasticResponse = (r: ElasticEngineResponse) => r.elasticResponse;