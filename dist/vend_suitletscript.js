'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/file'], function (record, search, file) {
  var onRequest = function onRequest(context) {
    try {
      var method = context.request.method;
      var mode = context.request.parameters.custparam_mode;
      var vendRecordId = context.request.parameters.custparam_vendrecordid;
      var vendRecordFileId = context.request.parameters.custparam_vendrecordfileid;

      if (mode === 'createinvoice' && method === 'GET') {
        createInvoice(vendRecordId, vendRecordFileId);
      } else {
        logModeUndefined();
      }
    } catch (error) {
      log.audit({
        title: 'Request failed',
        details: error
      });
    }
  };

  /*
  **********************************************************************************
  * CreateInvoice
  **********************************************************************************
  */

  var createInvoice = function createInvoice(vendRecordId, vendRecordFileId) {
    var vendRecord = retrieveRecord(vendRecordId); // eslint-disable-line
    var fileContents = retrieveFileContents(vendRecordFileId);
    var info = obtainInfo(fileContents);
    var items = obtainProducts(fileContents.payload.register_sale_products);
    log.audit({
      title: 'params',
      details: {
        recordId: vendRecordId,
        fileId: vendRecordFileId
      }
    });
    log.audit({ title: 'info', details: info });
    log.audit({ title: 'items', details: items });
  };

  var retrieveRecord = function retrieveRecord(vendRecordId) {
    return search.lookupFields({
      type: 'customrecord_vend_custom_record',
      id: vendRecordId,
      columns: ['name', 'custrecord_vend_file', 'custrecord_vend_id_netsuite_invoice']
    });
  };

  var retrieveFileContents = function retrieveFileContents(fileId) {
    var fileObj = file.load({ id: fileId });
    return JSON.parse(fileObj.getContents());
  };

  var obtainInfo = function obtainInfo(sale) {
    return {};
  };

  var obtainProducts = function obtainProducts(products) {
    var skuList = products.map(function (product) {
      return product.sku;
    });
    var localInfoOfSku = searchProducts(skuList);
    log.audit({ title: 'localInfoOfSku', details: localInfoOfSku });
    var productsWithAllInfo = products.map(function (product) {
      return Object.assign({}, product, localInfoOfSku[product.sku]);
    });
    return productsWithAllInfo;
  };

  var searchProducts = function searchProducts(skuList) {
    log.audit({
      title: 'Sku list',
      details: skuList
    });
    var searchOperation = search.create({
      type: search.Type.INVENTORY_ITEM,
      filters: [['isinactive', search.Operator.IS, 'F'], 'and', ['externalid', search.Operator.ANYOF, skuList]],
      columns: [_defineProperty({ name: 'itemid' }, 'name', 'externalid')]
    });
    var searchData = searchOperation.run();

    var productDict = traverseSearchData(searchData);
    return productDict;
  };

  var traverseSearchData = function traverseSearchData(searchData) {
    var CHUNK_SIZE = 1000;
    var dict = {};
    var i = 0;

    do {
      var chunk = searchData.getRange(i, i + CHUNK_SIZE);
      if (chunk && chunk.length) {
        for (var j = 0; j < chunk.length; ++j) {
          var product = obtainProduct(chunk[j]);
          if (!dict[product.sku]) {
            dict[product.sku] = product;
          }
        }
      }
      i += CHUNK_SIZE;
    } while (i < searchData.length);

    return dict;
  };

  var obtainProduct = function obtainProduct(product) {
    // eslint-disable-line
    return {
      internal_id: product.id,
      internal_name: product.getValue({ name: 'itemid' }),
      sku: product.getValue({ name: 'externalid' })
    };
  };

  var logModeUndefined = function logModeUndefined() {
    log.audit({
      title: 'Request failed',
      details: 'Mode not defined'
    });
  };

  return {
    onRequest: onRequest
  };
});

if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, constArgs) {
      // .length of function is 2
      'use strict';

      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        // eslint-disable-line
        var nextSource = arguments[index]; // eslint-disable-line

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}