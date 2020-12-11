import {SearchResults} from "@discowrap/core";

export class ElasticSearchResults extends SearchResults {

  constructor(responseBody: object) {
    super(responseBody);
  }

  extractIds(): string[] {
    if (this._responseBody && "hits" in this._responseBody && "hits" in this._responseBody["hits"]) {
      return this._responseBody["hits"]["hits"].map(hit => String(hit._id));
    }

    return [];
  }

  extractSearchHits(): object[] {
    if (this._responseBody && "hits" in this._responseBody && "hits" in this._responseBody["hits"]) {
      return this._responseBody["hits"]["hits"]; // TODO:  Common search hit format (id, score, etc..??)
    }

    return [];
  }

  extractTotal(): number {
    if (this._responseBody
      && "hits" in this._responseBody
      && "total" in this._responseBody["hits"]) {

      const total = this._responseBody["hits"]["total"];

      return (Number.isFinite(total))
        ? total
        : total.value;
    }

    return 0;
  }

  getHitId(hit: object): string {
    return hit["_id"];
  }

  getHitScore(hit: object): number {
    return hit["_score"];
  }
}

