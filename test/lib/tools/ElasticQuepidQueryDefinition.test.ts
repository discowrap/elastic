import {ElasticQuepidQueryDefinition} from "lib/tools/ElasticQuepidQueryDefinition";

function parameterizedQuepidQuery(query= "#$query##", tunableValue = "##tunableValue##" ) {
  return {
    query: {
      match: {
        "field": query
      }
    },
    size: tunableValue
  }
}

describe('Quepid Query Definitions', () => {
  it('render with parameters', () => {
    const qqd = ElasticQuepidQueryDefinition.fromDefinition({
      name: "qqd",
      definition: parameterizedQuepidQuery()
    });

    expect(qqd.transform()).resolves.toEqual(JSON.stringify(parameterizedQuepidQuery(), null, 2));
  });
});
