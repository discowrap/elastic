import {successful} from "@discowrap/core";
import {ElasticEngineSettingsDefinition} from "lib/ElasticEngineSettingsDefinition";
import {ElasticEngine} from "lib/ElasticEngine";

describe('ElasticEngineSettings Definitions', () => {
  it('can be deployed, and updated', () => {

    const settings50payload = {
      "persistent" : {
        "indices.recovery.max_bytes_per_sec" : "50mb"
      }
    };
    const settings50 = ElasticEngineSettingsDefinition.fromDefinition({
      name: "recovery_collar",
      definition: settings50payload
    });

    const settings20payload = {
      "persistent" : {
        "indices.recovery.max_bytes_per_sec" : "20mb"
      }
    };
    const settings20 = ElasticEngineSettingsDefinition.fromDefinition({
      name: "recovery_collar",
      definition: settings20payload
    });

    const searchHost = "http://localhost:9200";

    expect.assertions(3);

    return settings50.deploy(searchHost)
      .then(res => expect(successful(res.statusCode)).toBeTruthy())
      .then(() => new ElasticEngine(searchHost).getSettings())
      .then(res => expect(res["body"]).toMatchObject(settings50payload))
      .then(() => settings20.deploy(searchHost))
      .then(() => new ElasticEngine(searchHost).getSettings())
      .then(res => expect(res["body"]).toMatchObject(settings20payload))
  });

});
