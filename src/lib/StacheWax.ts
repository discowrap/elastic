let wax = {};

/**
 * wax.addKeyIf
 *
 * @param param - The mustache parameter this is conditioned upon.
 * @param obj - The object to add this key/value pair to.
 * @param key
 * @param value
 * @returns mustache template string
 */
wax["addKeyIf"] = ({ param, obj, key, value }) =>
  keyValueTemplateCondition({ obj, conditionalParam: param, key, thenValue: value });


/**
 * wax.array
 *
 * @param param – The mustache parameter containing the JSON array.
 * @param otherwise - (optional) mustache template string to use if array param is absent/empty.
 * @returns mustache template string
 */
wax["array"] = ({ param, otherwise }) => templateArray(param, otherwise);


/**
 * wax.if
 *
 * @param param – The mustache parameter this is conditioned upon.
 * @param value – The mustache string to use if param is present/set.
 * @param otherwise - (optional) value to add if param is absent/empty.
 * @returns mustache template string
 */
wax["if"] = ({ param, value, otherwise }) =>
  templateCondition({ conditionalParam:param , thenClause: value, otherwiseClause: otherwise });


/**
 * wax.unquote
 *
 * @param str - A mustache string which should not be double-quoted when rendered to Mustache from JSON
 */
wax["unquote"] = (str) => stringEscapeMarker(str);


/**
 * keyValueTemplateCondition
 *
 * Wraps k/v pair in preceeding/proceeding k/v pairs which serve as placeholders
 * for Mustache conditionals once the JSON is downconverted to Mustache.
 *
 * @param obj
 * @param conditionalParam
 * @param key
 * @param thenValue
 * @param otherwiseValue
 * @returns {*}
 */
const keyValueTemplateCondition = ({ obj, conditionalParam, key, thenValue }) => {
  let closePlaceholderKey = `{{/${conditionalParam}}}${key}`;
  if (thenValue) {
    let openPlaceholderKey = `{{#${conditionalParam}}}${key}`;
    obj[openPlaceholderKey] = null;
    obj[key] = thenValue;
    obj[closePlaceholderKey] = null;
  }

  return obj;
};


/**
 * templateCondition
 *
 * Wraps array element in Mustache conditionals wrapped with "<...>" to indicate double-quotes
 * which need removal once JSON is downconverted to Mustache.
 *
 * @param conditionalParam
 * @param thenClause
 * @param otherwiseClause
 * @returns {string}
 */
const templateCondition = ({conditionalParam, thenClause, otherwiseClause}) => {
  return "<" + ((thenClause) ? "{{#" + conditionalParam + "}}" + toMustache(thenClause) + "{{/" + conditionalParam + "}}" : "")
    + ((otherwiseClause) ? "{{^" + conditionalParam + "}}" + toMustache(otherwiseClause) + "{{/" + conditionalParam + "}}" : "")
    + ">";
};

/**
 * templateArray
 *
 * Wraps array element in Mustache conditionals wrapped with "<...>" to indicate double-quotes
 * which need removal once JSON is downconverted to Mustache.
 *
 * @param arrayParam
 * @param defaultValue
 */
const templateArray = (arrayParam, defaultValue) => {
  const defaultValueExpression = (defaultValue)
    ? `{{^${arrayParam}}}${defaultValue}{{/${arrayParam}}}`
    : "";

  return `<${defaultValueExpression}{{#toJson}}${arrayParam}{{/toJson}}>`;
};

/**
 * stringEscapeMarker
 *
 * Wraps mustacheStatement in "ESC<...>ESC" so that it may be string-escaped
 * after all other markers are replaced
 * @param mustacheStatement
 */
const stringEscapeMarker = (mustacheStatement) => {
  return `ESC<${JSON.stringify(mustacheStatement)}>ESC`;
};

/**
 * Downconvert JSON to Mustache by unwrapping some of the wrappers above needed for valid JSON / obj
 * @param validJson
 * @returns {string}
 */
const toMustache = (validJson) => {
  const mustache = JSON.stringify(validJson, null, 2)
    .replace(/(\\)+"/g, '"') // strips all string-encoding....?
    .replace('"{{#toJson}}', '{{#toJson}}')
    .replace('{{/toJson}}"', '{{/toJson}}')
    .replace(/"</g, "")
    .replace(/>"/g, "")
    .replace(/\\n/g, " ")
    .replace( /[\\"']({{[\w^#/]+}})[.\w]*[\\"'][:]\s+null,?/g, "$1" )
    .replace(/ESC<(.*)>ESC/g,  (match, p1) => escapeDoubleQuotes(p1));

  return (isJson(mustache)) ? mustache : compressMustache(mustache);
};

const compressMustache = (content) => {
  return content
    .replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, ' ')
    .replace(/([{}\\[\\]:])\s+([{}\\[\\]\\])/g, '$1$2');
};

const escapeDoubleQuotes = (mustacheStatement) => {
  return mustacheStatement.replace(/"/g, '\\"' )
};

const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
/*
 * end Mustashification help
 */

module.exports = {
  wax,
  toMustache,
  compressMustache
};
