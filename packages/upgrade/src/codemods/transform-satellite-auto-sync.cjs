module.exports = function transformSatelliteAutoSync({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirty = false;

  // Handle JSX attributes: <Component isSatellite /> → <Component isSatellite satelliteAutoSync={true} />
  root.find(j.JSXOpeningElement).forEach(path => {
    const { attributes } = path.node;
    if (!attributes) {
      return;
    }

    const hasIsSatellite = attributes.some(attr => isJsxAttrNamed(attr, 'isSatellite'));
    if (!hasIsSatellite) {
      return;
    }

    const hasAutoSync = attributes.some(attr => isJsxAttrNamed(attr, 'satelliteAutoSync'));
    if (hasAutoSync) {
      return;
    }

    const autoSyncAttr = j.jsxAttribute(
      j.jsxIdentifier('satelliteAutoSync'),
      j.jsxExpressionContainer(j.booleanLiteral(true)),
    );
    attributes.push(autoSyncAttr);
    dirty = true;
  });

  // Handle object properties: { isSatellite: true } → { isSatellite: true, satelliteAutoSync: true }
  root.find(j.ObjectExpression).forEach(path => {
    const { properties } = path.node;

    const hasIsSatellite = properties.some(prop => isObjectPropertyNamed(prop, 'isSatellite'));
    if (!hasIsSatellite) {
      return;
    }

    const hasAutoSync = properties.some(prop => isObjectPropertyNamed(prop, 'satelliteAutoSync'));
    if (hasAutoSync) {
      return;
    }

    const isSatelliteIndex = properties.findIndex(prop => isObjectPropertyNamed(prop, 'isSatellite'));
    const autoSyncProp = j.objectProperty(j.identifier('satelliteAutoSync'), j.booleanLiteral(true));
    properties.splice(isSatelliteIndex + 1, 0, autoSyncProp);
    dirty = true;
  });

  return dirty ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

function isJsxAttrNamed(attribute, name) {
  return attribute && attribute.type === 'JSXAttribute' && attribute.name && attribute.name.name === name;
}

function isObjectPropertyNamed(prop, name) {
  if (!prop || (prop.type !== 'ObjectProperty' && prop.type !== 'Property')) {
    return false;
  }
  const { key } = prop;
  if (!key) {
    return false;
  }
  if (key.type === 'Identifier') {
    return key.name === name;
  }
  if (key.type === 'StringLiteral' || key.type === 'Literal') {
    return key.value === name;
  }
  return false;
}
