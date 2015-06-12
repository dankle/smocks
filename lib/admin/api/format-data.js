var _ = require('lodash');

module.exports = formatData;

function formatData(mocker) {
  return {
    routes: formatRoutes(mocker._routes, mocker),
    variants: formatVariants(mocker._variants, mocker, 'global'),
    globalConfig: formatPluginConfig(mocker),
    globalConfigValues: mocker.globalConfigValues || {}
  };
}

function formatPluginConfig(mocker) {
  var rtn = [];
  _.each(mocker._plugins, function(plugin) {
    if (plugin.config) {
      rtn.push({
        id: plugin.id,
        config: plugin.config
      });
    }
  });
  return rtn;
}

function formatRoutes(routes, mocker) {
  return _.compact(_.map(routes, function(route) {
    if (!route.hasVariants()) {
      return undefined;
    }
    return {
      id: route.id,
      path: route.path,
      method: route._method,
      label: route._label,
      variants: formatVariants(route.variants, mocker),
      config: formatConfig(route, mocker),
      selections: formatSelections(route),
      activeVariant: route.activeVariant
    };
  }));
}

function formatSelections(route) {
  var variantSelections = {};
  _.each(route.variants, function(variant, id) {
    variantSelections[id] = variant.selectedConfig;
  });
  return {
    self: route.selectedConfig,
    variants: variantSelections
  };
}

function formatVariants(variants, mocker, type) {
  return _.map(variants, function(variant) {
    return {
      id: variant.id,
      routeSpecificId: type ? (type + ':' + variant.id) : variant.id,
      label: variant.label,
      selected: variant.isSelected,
      config: formatConfig(variant, mocker)
    };
  });
}

function formatConfig(obj, mocker, request) {
  var rtn = {};
  _.each(obj.config(), function(data, key) {
    rtn[key] = _.clone(data);
    rtn[key].id = key;
    _.each(data, function(value, _key) {
      if (_.isFunction(value)) {
        rtn[key][_key] = value.call(mocker.state.get());
      }
    });
  });
  return rtn;
}