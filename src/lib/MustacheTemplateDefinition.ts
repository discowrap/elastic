import {Definition} from "@discowrap/core";

const {toMustache, compressMustache} = require("lib/StacheWax");

export abstract class MustacheTemplateDefinition extends Definition {
  _template: string;

  protected constructor(name, template) {
    super(name);
    this._template = template;
  }

  definition() {
    return this._template; // the template
  }

  /**
   * Externalizes the internal object representation of the template into valid Mustache
   * @param compress
   */
  transform(compress: boolean = false) {
    const transformed = toMustache(this.definition());
    return Promise.resolve((compress) ? compressMustache(transformed) : transformed)
  };
}
