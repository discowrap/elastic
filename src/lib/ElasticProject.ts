import {resolve} from "path";
import {Project, ProjectStructure} from "@discowrap/core";

/*
 * A Project knows where things are in your project and where they should be installed
 * (It represents the "opinionated" conventions)
 *
 * Project owns the "install" target.  The install flow should be independent of
 * search platform.  (Though the installable assets are defined in the platform specializations, as here).
 */


const DEFAULT_ELASTIC_PROJECT_STRUCTURE = new ProjectStructure([
  {
    "type": "cluster",
    "src": {
      "dir": "cluster",
      "extension": ["ts", "js"]
    },
    "install": {
      "dir": "cluster",
      "extension": ".json"
    },
    "deploy": {
      "name_prefix": "setting_"
    }
  },
  {
    "type": "index/template",
    "src": {
      "dir": "index/template",
      "extension": ["ts", "js"]
    },
    "install": {
      "dir": "index/template",
      "extension": ".json"
    },
    "deploy": {
      "name_prefix": "indext_"
    }
  },
  {
    "type": "index",
    "src": {
      "dir": "index",
      "extension": ["ts", "js"]
    },
    "install": {
      "dir": "index",
      "extension": ".json"
    },
    "deploy": {
      "name_prefix": "index_"
    }
  },
  {
    "type": "featureset",
    "src": {
      "dir": "featureset",
      "extension": ["ts", "js"]
    },
    "install": {
      "dir": "featureset",
      "extension": ".mustache"
    },
    "deploy": {
      "name_prefix": "featureset_"
    }
  },
  {
    "type": "query",
    "src": {
      "dir": "query",
      "extension": ["ts", "js"],
    },
    "install": {
      "dir": "query",
      "extension": ".mustache"
    },
    "deploy": {
      "name_prefix": "query_"
    }
  },
  {
    "type": "query/quepid",
    "src": {
      "dir": "query/quepid",
      "extension": ["ts", "js"],
    },
    "install": {
      "dir": "query/quepid",
      "extension": ".json"
    },
    "deploy": {
      "name_prefix": "quepid_"
  }
  }
]);

export default (projectRoot, installDir?, templateRoot?, structure?: ProjectStructure) => {
    return new Project(
      projectRoot,
      (structure !== undefined) ? structure : DEFAULT_ELASTIC_PROJECT_STRUCTURE,
      (installDir !== undefined) ? installDir : resolve(projectRoot, 'install'),
      (templateRoot !== undefined) ? templateRoot : projectRoot
    );
}