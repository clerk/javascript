const upper = name => name[0].toUpperCase() + name.slice(1);
const identifier = value =>
  String(value)
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[0-9]/, c => `value${c}`);
const quoted = value => `\`${identifier(value)}\``;

export function generateNative(model, manifest) {
  const definitions = structuredClone(model.definitions);
  function lift(shape, name) {
    if (shape.kind === 'union' || shape.kind === 'tuple') {
      if (definitions[name]) throw new Error(`Synthetic type collision: ${name}`);
      definitions[name] = { ...shape, name, properties: [], methods: [] };
      if (shape.variants) definitions[name].variants = shape.variants.map((s, i) => lift(s, `${name}Case${i + 1}`));
      if (shape.elements) definitions[name].elements = shape.elements.map((s, i) => lift(s, `${name}Item${i + 1}`));
      return { kind: 'ref', name };
    }
    if (shape.kind === 'optional') return { ...shape, value: lift(shape.value, `${name}Value`) };
    if (shape.kind === 'array') return { ...shape, element: lift(shape.element, `${name}Element`) };
    if (shape.kind === 'dictionary') return { ...shape, value: lift(shape.value, `${name}Value`) };
    return shape;
  }
  for (const definition of Object.values(definitions)) {
    for (const p of definition.properties || []) p.type = lift(p.type, `${definition.name}${upper(p.name)}`);
    for (const method of definition.methods || []) {
      for (const p of method.parameters)
        p.type = lift(p.type, `${definition.name}${upper(method.name)}${upper(p.name)}`);
      method.result = lift(method.result, `${definition.name}${upper(method.name)}Return`);
    }
    if (definition.variants)
      definition.variants = definition.variants.map((s, i) => lift(s, `${definition.name}Variant${i + 1}`));
  }
  const unoptional = shape => (shape.kind === 'optional' ? shape.value : shape);
  const forbidden = property => ['never', 'undefined'].includes(unoptional(property.type).kind);
  const fields = definition => (definition.properties || []).filter(p => !forbidden(p));
  const isPresence = shape => shape.kind === 'optional' && shape.nullable && shape.omittable;
  function type(shape, language) {
    switch (shape.kind) {
      case 'ref':
        return shape.name;
      case 'string':
      case 'literal':
        return typeof shape.value === 'number'
          ? 'Double'
          : typeof shape.value === 'boolean'
            ? language === 'swift'
              ? 'Bool'
              : 'Boolean'
            : 'String';
      case 'number':
        return 'Double';
      case 'boolean':
        return language === 'swift' ? 'Bool' : 'Boolean';
      case 'null':
      case 'json':
        return language === 'swift' ? 'JSONValue' : 'JsonElement';
      case 'jsonObject':
        return language === 'swift' ? '[String: JSONValue]' : 'JsonObject';
      case 'date':
        return language === 'swift' ? 'Date' : 'Instant';
      case 'url':
        return language === 'swift' ? 'URL' : 'URI';
      case 'binary':
        return language === 'swift' ? 'Data' : 'ByteArray';
      case 'file':
        return 'UploadFile';
      case 'void':
      case 'undefined':
      case 'errorResult':
        return language === 'swift' ? 'Void' : 'Unit';
      case 'optional':
        return isPresence(shape) ? `Field<${type(shape.value, language)}>` : `${type(shape.value, language)}?`;
      case 'array':
        return language === 'swift' ? `[${type(shape.element, language)}]` : `List<${type(shape.element, language)}>`;
      case 'dictionary':
        return language === 'swift'
          ? `[String: ${type(shape.value, language)}]`
          : `Map<String, ${type(shape.value, language)}>`;
      default:
        throw new Error(`Unsupported native type: ${JSON.stringify(shape)}`);
    }
  }
  function encode(shape, value, language) {
    const swift = language === 'swift';
    switch (shape.kind) {
      case 'ref':
      case 'file':
        return swift ? `try ${value}.encode()` : `${value}.toJson()`;
      case 'string':
        return swift ? `.string(${value})` : `JsonPrimitive(${value})`;
      case 'literal':
        return swift
          ? `.${typeof shape.value === 'boolean' ? 'bool' : typeof shape.value === 'number' ? 'number' : 'string'}(${JSON.stringify(shape.value)})`
          : `JsonPrimitive(${JSON.stringify(shape.value)})`;
      case 'number':
        return swift ? `.number(${value})` : `JsonPrimitive(${value})`;
      case 'boolean':
        return swift ? `.bool(${value})` : `JsonPrimitive(${value})`;
      case 'json':
      case 'null':
        return value;
      case 'jsonObject':
        return swift ? `.object(${value})` : value;
      case 'date':
        return swift
          ? `.string(${value}.ISO8601Format(.init(includingFractionalSeconds: true)))`
          : `JsonPrimitive(${value}.toString())`;
      case 'url':
        return swift ? `.string(${value}.absoluteString)` : `JsonPrimitive(${value}.toString())`;
      case 'binary':
        return swift
          ? `.object(["base64": .string(${value}.base64EncodedString())])`
          : `buildJsonObject { put("base64", Base64.getEncoder().encodeToString(${value})) }`;
      case 'array':
        return swift
          ? `.array(try ${value}.map { value in ${encode(shape.element, 'value', language)} })`
          : `JsonArray(${value}.map { value -> ${encode(shape.element, 'value', language)} })`;
      case 'dictionary':
        return swift
          ? `.object(try ${value}.mapValues { value in ${encode(shape.value, 'value', language)} })`
          : `JsonObject(${value}.mapValues { (_, value) -> ${encode(shape.value, 'value', language)} })`;
      case 'optional':
        if (isPresence(shape))
          return swift
            ? `try ${value}.encode { value in ${encode(shape.value, 'value', language)} }`
            : `${value}.toJson { value -> ${encode(shape.value, 'value', language)} }`;
        return swift
          ? `try ${value}.map { value in ${encode(shape.value, 'value', language)} } ?? ${shape.omittable ? '.undefined' : '.null'}`
          : `${value}?.let { value -> ${encode(shape.value, 'value', language)} } ?: ${shape.omittable ? 'Undefined' : 'JsonNull'}`;
      case 'void':
      case 'undefined':
        return swift ? '.undefined' : 'Undefined';
      default:
        throw new Error(`Unsupported native encoder: ${shape.kind}`);
    }
  }
  function decode(shape, value, language) {
    const swift = language === 'swift';
    switch (shape.kind) {
      case 'ref':
        return swift ? `try ${shape.name}.decode(${value}, in: runtime)` : `${shape.name}.fromJson(${value}, runtime)`;
      case 'file':
        return swift ? `try UploadFile.decode(${value})` : `UploadFile.fromJson(${value})`;
      case 'string':
        return swift ? `try ${value}.string()` : `${value}.requireString()`;
      case 'literal':
        return swift
          ? `try ${value}.literal(${encode(shape, '', language)}).${typeof shape.value === 'number' ? 'number' : typeof shape.value === 'boolean' ? 'bool' : 'string'}()`
          : `${value}.requireLiteral(${encode(shape, '', language)}).${typeof shape.value === 'number' ? 'requireDouble' : typeof shape.value === 'boolean' ? 'requireBoolean' : 'requireString'}()`;
      case 'number':
        return swift ? `try ${value}.number()` : `${value}.requireDouble()`;
      case 'boolean':
        return swift ? `try ${value}.bool()` : `${value}.requireBoolean()`;
      case 'json':
      case 'null':
        return value;
      case 'jsonObject':
        return swift ? `try ${value}.object()` : `${value}.jsonObject`;
      case 'date':
        return swift ? `try ${value}.date()` : `Instant.parse(${value}.requireString())`;
      case 'url':
        return swift ? `try ${value}.url()` : `URI(${value}.requireString())`;
      case 'binary':
        return swift
          ? `try ${value}.data()`
          : `Base64.getDecoder().decode(${value}.jsonObject.getValue("base64").requireString())`;
      case 'array':
        return swift
          ? `try ${value}.array().map { value in ${decode(shape.element, 'value', language)} }`
          : `${value}.jsonArray.map { value -> ${decode(shape.element, 'value', language)} }`;
      case 'dictionary':
        return swift
          ? `try ${value}.object().mapValues { value in ${decode(shape.value, 'value', language)} }`
          : `${value}.jsonObject.mapValues { (_, value) -> ${decode(shape.value, 'value', language)} }`;
      case 'optional':
        if (isPresence(shape))
          return swift
            ? `try Field.decode(${value}) { value in ${decode(shape.value, 'value', language)} }`
            : `Field.fromJson(${value}) { value -> ${decode(shape.value, 'value', language)} }`;
        return swift
          ? `try ${value}.optional { value in ${decode(shape.value, 'value', language)} }`
          : `${value}.decodeOptional { value -> ${decode(shape.value, 'value', language)} }`;
      default:
        throw new Error(`Unsupported native decoder: ${shape.kind}`);
    }
  }
  function defaults(p, language) {
    if (isPresence(p.type)) return language === 'swift' ? ' = .omitted' : ' = Field.Omitted';
    if (p.optional || (p.type.kind === 'optional' && p.type.omittable))
      return language === 'swift' ? ' = nil' : ' = null';
    return '';
  }

  function swiftObject(definition, name = definition.name) {
    const properties = fields(definition);
    const parameters = properties.filter(p => p.type.kind !== 'literal');
    return (
      `public struct ${name}: Hashable, Sendable {\n${properties.map(p => `  public ${p.type.kind === 'literal' ? 'var' : 'let'} ${quoted(p.name)}: ${type(p.type, 'swift')}${p.type.kind === 'literal' ? ` { ${JSON.stringify(p.type.value)} }` : ''}`).join('\n')}\n` +
      `  public init(${parameters.map(p => `${quoted(p.name)}: ${type(p.type, 'swift')}${defaults(p, 'swift')}`).join(', ')}) {\n${parameters.map(p => `    self.${quoted(p.name)} = ${quoted(p.name)}`).join('\n')}\n  }\n` +
      `  @MainActor public func encode() throws -> JSONValue {\n    let values: [String: JSONValue] = [${properties.length ? '\n' : ':'}${properties.map(p => `      ${JSON.stringify(p.name)}: ${encode(p.type, `self.${quoted(p.name)}`, 'swift')}`).join(',\n')}\n    ]\n    return .object(values.filter { !$0.value.isUndefined })\n  }\n` +
      `  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ${name} {\n    let values = try value.object()\n${properties
        .filter(p => p.type.kind === 'literal')
        .map(
          p =>
            `    guard values[${JSON.stringify(p.name)}] == ${encode(p.type, '', 'swift')} else { throw CoreError.invalidValue }`,
        )
        .join(
          '\n',
        )}\n    return try ${name}(${parameters.map(p => `${quoted(p.name)}: ${decode(p.type, `(values[${JSON.stringify(p.name)}] ?? .undefined)`, 'swift')}`).join(', ')})\n  }\n}\n`
    );
  }
  function kotlinObject(definition, name = definition.name) {
    const properties = fields(definition);
    const parameters = properties.filter(p => p.type.kind !== 'literal');
    return (
      `public ${parameters.length ? 'data ' : ''}class ${name}(${parameters.map(p => `public val ${quoted(p.name)}: ${type(p.type, 'kotlin')}${defaults(p, 'kotlin')}`).join(', ')}) {\n` +
      properties
        .filter(p => p.type.kind === 'literal')
        .map(p => `  public val ${quoted(p.name)}: ${type(p.type, 'kotlin')} get() = ${JSON.stringify(p.type.value)}\n`)
        .join('') +
      `  public fun toJson(): JsonElement = buildJsonObject {\n${properties.map(p => `    putPresent(${JSON.stringify(p.name)}, ${encode(p.type, `this@${name}.${quoted(p.name)}`, 'kotlin')})`).join('\n')}\n  }\n` +
      `  public companion object {\n    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ${name} {\n      val values = value.jsonObject\n${properties
        .filter(p => p.type.kind === 'literal')
        .map(p => `      require(values[${JSON.stringify(p.name)}] == JsonPrimitive(${JSON.stringify(p.type.value)}))`)
        .join(
          '\n',
        )}\n      return ${name}(${parameters.map(p => `${quoted(p.name)} = ${decode(p.type, `(values[${JSON.stringify(p.name)}] ?: Undefined)`, 'kotlin')}`).join(', ')})\n    }\n  }\n}\n`
    );
  }

  let swift = '// Generated from TypeScript. Do not edit.\nimport Foundation\nimport Observation\n\n';
  let kotlin =
    '// Generated from TypeScript. Do not edit.\n@file:Suppress("RedundantVisibilityModifier", "UNUSED_PARAMETER", "UNUSED_VARIABLE")\npackage com.clerk.api\n\nimport java.net.URI\nimport java.time.Instant\nimport java.util.Base64\nimport kotlinx.coroutines.flow.Flow\nimport kotlinx.coroutines.flow.MutableStateFlow\nimport kotlinx.coroutines.flow.map\nimport kotlinx.serialization.json.*\n\n';
  const resourceNames = [];
  const swiftSurface = [],
    kotlinSurface = [];
  const docs = (value, language, indent = '') => {
    const text = [value.documentation, value.deprecated && `Deprecated: ${value.deprecated}`]
      .filter(Boolean)
      .join('\n');
    if (!text) return '';
    const safe = text.replaceAll('*/', '* /');
    return language === 'swift'
      ? safe
          .split('\n')
          .map(line => `${indent}/// ${line}`)
          .join('\n') + '\n'
      : `${indent}/**\n${safe
          .split('\n')
          .map(line => `${indent} * ${line}`)
          .join('\n')}\n${indent} */\n`;
  };
  function commonStringFields(definition) {
    if (definition.kind !== 'union') return [];
    const variants = definition.variants.map(shape => (shape.kind === 'ref' ? definitions[shape.name] : shape));
    if (variants.some(variant => !['object', 'resource'].includes(variant.kind))) return [];
    return (variants[0].properties || [])
      .filter(property =>
        variants.every(variant => {
          const candidate = variant.properties.find(p => p.name === property.name && !p.optional);
          if (!candidate) return false;
          const shape = candidate.type.kind === 'ref' ? definitions[candidate.type.name] : candidate.type;
          return (
            shape.kind === 'string' ||
            shape.kind === 'enum' ||
            (shape.kind === 'literal' && typeof shape.value === 'string')
          );
        }),
      )
      .map(property => ({
        name: property.name,
        variants: variants.map(variant => variant.properties.find(p => p.name === property.name).type),
      }));
  }
  function commonAccess(property, index) {
    const shape = property.variants[index];
    return `value.${quoted(property.name)}${shape.kind === 'ref' && definitions[shape.name].kind === 'enum' ? '.rawValue' : ''}`;
  }
  for (const definition of Object.values(definitions)) {
    const { name, kind } = definition;
    swift += docs(definition, 'swift');
    kotlin += docs(definition, 'kotlin');
    for (const [language, surface] of [
      ['swift', swiftSurface],
      ['kotlin', kotlinSurface],
    ]) {
      surface.push(`${kind} ${name}`);
      if (language === 'swift') surface.push(`${name}: Hashable`);
      for (const property of fields(definition))
        surface.push(`${name}.${property.name}: ${type(property.type, language)}${defaults(property, language)}`);
      for (const method of definition.methods || [])
        surface.push(
          `${name}.${method.nativeName || method.name}(${method.parameters.map(p => `${p.name}: ${type(p.type, language)}${defaults(p, language)}`).join(', ')}): ${type(method.result, language)} [${method.errorResult ? 'error-envelope' : method.invocation === 'readProperty' ? 'explicit-read' : 'return'}]`,
        );
      for (const property of commonStringFields(definition))
        surface.push(`${name}.${property.name}: String [shared union field]`);
      if (definition.values) surface.push(`${name} cases: ${definition.values.join(', ')}, unrecognized(String)`);
      if (definition.variants)
        surface.push(`${name} variants: ${definition.variants.map(v => type(v, language)).join(' | ')}`);
      if (definition.elements)
        surface.push(`${name} tuple: ${definition.elements.map(v => type(v, language)).join(', ')}`);
    }
    if (kind === 'object') {
      if (definition.index) throw new Error(`Native dictionary with named members needs a policy: ${name}`);
      swift += swiftObject(definition) + '\n';
      kotlin += kotlinObject(definition) + '\n';
    } else if (kind === 'enum') {
      const cases = definition.values.map(value => [value, identifier(value)]);
      if (new Set(cases.map(([, c]) => c)).size !== cases.length || cases.some(([, c]) => c === 'unrecognized'))
        throw new Error(`Enum naming collision: ${name}`);
      swift += `public enum ${name}: Hashable, Sendable {\n${cases.map(([, c]) => `  case ${quoted(c)}`).join('\n')}\n  case unrecognized(String)\n  public var rawValue: String {\n    switch self {\n${cases.map(([value, c]) => `    case .${quoted(c)}: return ${JSON.stringify(value)}`).join('\n')}\n    case .unrecognized(let value): return value\n    }\n  }\n  public init(rawValue: String) {\n    switch rawValue {\n${cases.map(([value, c]) => `    case ${JSON.stringify(value)}: self = .${quoted(c)}`).join('\n')}\n    default: self = .unrecognized(rawValue)\n    }\n  }\n  public func encode() throws -> JSONValue { .string(rawValue) }\n  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ${name} { .init(rawValue: try value.string()) }\n}\n\n`;
      kotlin += `public sealed class ${name}(public val rawValue: String) {\n${cases.map(([value, c]) => `  public data object ${upper(c)} : ${name}(${JSON.stringify(value)})`).join('\n')}\n  public data class Unrecognized(val value: String) : ${name}(value)\n  public fun toJson(): JsonElement = JsonPrimitive(rawValue)\n  public companion object {\n    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ${name} = when (val raw = value.requireString()) {\n${cases.map(([value, c]) => `      ${JSON.stringify(value)} -> ${upper(c)}`).join('\n')}\n      else -> Unrecognized(raw)\n    }\n  }\n}\n\n`;
    } else if (kind === 'union') {
      const variants = definition.variants;
      const common = commonStringFields(definition);
      const swiftCommon = common
        .map(
          property =>
            `  @MainActor public var ${quoted(property.name)}: String {\n    switch self {\n${variants.map((variant, index) => `    case .case${index + 1}(let value): return ${commonAccess(property, index)}`).join('\n')}\n    }\n  }\n`,
        )
        .join('');
      const kotlinCommon = common
        .map(
          property =>
            `  public val ${quoted(property.name)}: String get() = when (this) {\n${variants.map((variant, index) => `    is Case${index + 1} -> ${commonAccess(property, index)}`).join('\n')}\n  }\n`,
        )
        .join('');
      swift += `public indirect enum ${name}: Hashable, Sendable {\n${variants.map((v, i) => `  case case${i + 1}(${type(v, 'swift')})`).join('\n')}\n${swiftCommon}  @MainActor public func encode() throws -> JSONValue {\n    switch self {\n${variants.map((v, i) => `    case .case${i + 1}(let value): return .object(["$case": .number(${i}), "value": ${encode(v, 'value', 'swift')}])`).join('\n')}\n    }\n  }\n  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ${name} {\n    let values = try value.object()\n    let payload = values["value"] ?? .undefined\n    switch try (values["$case"] ?? .undefined).number() {\n${variants.map((v, i) => `    case ${i}: return .case${i + 1}(${decode(v, 'payload', 'swift')})`).join('\n')}\n    default: throw CoreError.invalidValue\n    }\n  }\n}\n\n`;
      kotlin += `public sealed interface ${name} {\n${variants.map((v, i) => `  public data class Case${i + 1}(val value: ${type(v, 'kotlin')}) : ${name}`).join('\n')}\n${kotlinCommon}  public fun toJson(): JsonElement = when (this) {\n${variants.map((v, i) => `    is Case${i + 1} -> JsonObject(mapOf("\\$case" to JsonPrimitive(${i}), "value" to ${encode(v, 'value', 'kotlin')}))`).join('\n')}\n  }\n  public companion object {\n    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ${name} {\n      val values = value.jsonObject\n      val payload = values["value"] ?: Undefined\n      return when (values.getValue("\\$case").jsonPrimitive.int) {\n${variants.map((v, i) => `        ${i} -> Case${i + 1}(${decode(v, 'payload', 'kotlin')})`).join('\n')}\n        else -> throw CoreException("invalid_value")\n      }\n    }\n  }\n}\n\n`;
    } else if (kind === 'tuple') {
      const tuple = { name, properties: definition.elements.map((s, i) => ({ name: `item${i}`, type: s })) };
      swift += `public struct ${name}: Hashable, Sendable {\n${tuple.properties.map(p => `  public let ${p.name}: ${type(p.type, 'swift')}`).join('\n')}\n  public init(${tuple.properties.map(p => `${p.name}: ${type(p.type, 'swift')}`).join(', ')}) { ${tuple.properties.map(p => `self.${p.name} = ${p.name}`).join('; ')} }\n  @MainActor public func encode() throws -> JSONValue { .array([${tuple.properties.map(p => encode(p.type, p.name, 'swift')).join(', ')}]) }\n  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ${name} {\n    let values = try value.array()\n    guard values.count == ${tuple.properties.length} else { throw CoreError.invalidValue }\n    return ${name}(${tuple.properties.map((p, i) => `${p.name}: ${decode(p.type, `values[${i}]`, 'swift')}`).join(', ')})\n  }\n}\n\n`;
      kotlin += `public data class ${name}(${tuple.properties.map(p => `public val ${p.name}: ${type(p.type, 'kotlin')}`).join(', ')}) {\n  public fun toJson(): JsonElement = JsonArray(listOf(${tuple.properties.map(p => encode(p.type, p.name, 'kotlin')).join(', ')}))\n  public companion object {\n    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ${name} {\n      val values = value.jsonArray\n      require(values.size == ${tuple.properties.length})\n      return ${name}(${tuple.properties.map((p, i) => `${p.name} = ${decode(p.type, `values[${i}]`, 'kotlin')}`).join(', ')})\n    }\n  }\n}\n\n`;
    } else if (kind === 'resource') {
      resourceNames.push(name);
      swift += swiftObject(definition, `${name}State`);
      swift += `@MainActor @Observable public final class ${name}: CoreResource {\n  public let handle: ResourceHandle\n  public let context: ResourceContext\n  public var isInvalidated: Bool { context.isInvalidated(handle) }\n  public var state: ${name}State { context.state(handle, as: ${name}State.self) }\n  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: ${name === 'Clerk' ? 'true' : 'false'}) }\n${fields(
        definition,
      )
        .map(p => `  public var ${quoted(p.name)}: ${type(p.type, 'swift')} { state.${quoted(p.name)} }`)
        .join(
          '\n',
        )}\n  public func prepare(_ value: JSONValue) throws -> any Sendable { try ${name}State.decode(value, in: context.requireRuntime()) }\n  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }\n  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ${name} { try runtime.resource(ResourceHandle.decodeReference(value), as: ${name}.self) }\n`;
      kotlin += kotlinObject(definition, `${name}State`);
      kotlin += `public class ${name}(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {\n  override val context: ResourceContext = ResourceContext(runtime, handle, ${name === 'Clerk' ? 'true' : 'false'})\n  public val state: ${name}State get() = context.state(handle)\n  public val changes: Flow<${name}State> = runtime.changes.map { state }\n  override val isInvalidated: Boolean get() = context.isInvalidated(handle)\n${fields(
        definition,
      )
        .map(p => `  public val ${quoted(p.name)}: ${type(p.type, 'kotlin')} get() = state.${quoted(p.name)}`)
        .join(
          '\n',
        )}\n  override fun prepare(value: JsonElement): Any = ${name}State.fromJson(value, context.requireRuntime())\n  public fun toJson(): JsonElement = buildJsonObject { put("\\$ref", handle.toJson()) }\n  public companion object {\n    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ${name} = runtime.resource(ResourceHandle.fromReference(value)) as ${name}\n  }\n`;
      for (const method of definition.methods) {
        const operation = JSON.stringify(`${name}.${method.name}`);
        swift += docs(method, 'swift', '  ');
        kotlin += docs(method, 'kotlin', '  ');
        const args = method.parameters;
        swift += `  public func ${quoted(method.nativeName || method.name)}(${args.map((p, i) => `${i === 0 ? '_ ' : ''}${quoted(p.name)}: ${type(p.type, 'swift')}${defaults(p, 'swift')}`).join(', ')}) async throws${type(method.result, 'swift') === 'Void' ? '' : ` -> ${type(method.result, 'swift')}`} {\n    let runtime = try context.requireRuntime()\n    return try await runtime.invoke(owner: self, target: handle, operation: ${operation}, arguments: [${args.map(p => encode(p.type, quoted(p.name), 'swift')).join(', ')}]) { result in\n`;
        kotlin += `  public suspend fun ${quoted(method.nativeName || method.name)}(${args.map(p => `${quoted(p.name)}: ${type(p.type, 'kotlin')}${defaults(p, 'kotlin')}`).join(', ')}): ${type(method.result, 'kotlin')} {\n    val runtime = context.requireRuntime()\n    return runtime.invoke(this, handle, ${operation}, listOf(${args.map(p => encode(p.type, quoted(p.name), 'kotlin')).join(', ')})) { result ->\n`;
        if (method.errorResult) {
          swift += '      try runtime.checkErrorResult(result)\n';
          kotlin += '      runtime.checkErrorResult(result)\n';
        } else if (['void', 'undefined'].includes(method.result.kind)) {
          swift += '      _ = result\n';
          kotlin += '      Unit\n';
        } else {
          swift += `      return ${decode(method.result, 'result', 'swift')}\n`;
          kotlin += `      ${decode(method.result, 'result', 'kotlin')}\n`;
        }
        swift += '    }\n  }\n';
        kotlin += '    }\n  }\n';
      }
      swift += '}\n\n';
      kotlin += '}\n\n';
    } else throw new Error(`Unsupported native declaration: ${kind}`);
  }
  swift += `@MainActor public enum GeneratedBindings {\n  public static let contractHash = ${JSON.stringify(manifest.contractHash)}\n  public static let protocolVersion = ${manifest.protocolVersion}\n  public static func makeResource(_ handle: ResourceHandle, runtime: CoreRuntime) throws -> any CoreResource {\n    switch handle.type {\n${resourceNames.map(name => `    case ${JSON.stringify(name)}: return ${name}(handle: handle, runtime: runtime)`).join('\n')}\n    default: throw CoreError.invalidResource\n    }\n  }\n}\n`;
  kotlin += `public object GeneratedBindings {\n  public const val contractHash: String = ${JSON.stringify(manifest.contractHash)}\n  public const val protocolVersion: Int = ${manifest.protocolVersion}\n  public fun makeResource(handle: ResourceHandle, runtime: CoreRuntime): CoreResource = when (handle.type) {\n${resourceNames.map(name => `    ${JSON.stringify(name)} -> ${name}(handle, runtime)`).join('\n')}\n    else -> throw CoreException("invalid_resource")\n  }\n}\n`;
  return {
    'GeneratedAPI.swift': swift.replace(/[ \t]+$/gm, ''),
    'GeneratedAPI.kt': kotlin.replace(/[ \t]+$/gm, ''),
    'swift-api.txt': swiftSurface.sort().join('\n') + '\n',
    'kotlin-api.txt': kotlinSurface.sort().join('\n') + '\n',
  };
}
