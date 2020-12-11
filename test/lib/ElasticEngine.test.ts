import {ElasticEngine} from "lib/ElasticEngine";
import {successful} from "@discowrap/core";

describe('the engine should', () => {
  it('expect the health check to fail when cluster is down or unreachable', async () => {
    const engine = new ElasticEngine('http://no.engines.herez.io');
    const health = await engine.healthy();

    return expect(successful(health.statusCode)).toBeFalsy();
  });


  it('expect the health check to succeed when cluster is up and reachable', async () => {
    const engine = new ElasticEngine();
    const health = await engine.healthy();

    return expect(successful(health.statusCode)).toBeTruthy();
  });


});
