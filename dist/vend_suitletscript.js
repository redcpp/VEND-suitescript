'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

    try {
      var invoice = createInvoiceRecord(35);
      setInfo(invoice, {});
      for (var i = 0; i < items.length; i++) {
        addItem(invoice, {
          item: items[i].internal_id,
          quantity: items[i].quantity
        });
      }
      var invoiceId = save(invoice);
      log.audit({
        title: 'Invoice - success',
        details: 'Invoice id: ' + invoiceId
      });
    } catch (error) {
      log.audit({
        title: 'Invoice - fail',
        details: error
      });
    }
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
    }).filter(function (product) {
      return product.internal_id;
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
    return {
      internal_id: parseInt(product.id),
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

  var defaultInfo = {
    subsidiary: 2,
    location: 4,
    custbody_efx_pos_origen: true,
    memo: 'go_invoice_test',
    approvalstatus: 1
  };

  var defaultItem = {
    item: 42,
    quantity: 2,
    tax_code: 5
  };

  var createInvoiceRecord = function createInvoiceRecord(customer) {
    return record.create({
      type: record.Type.INVOICE,
      isDynamic: true,
      defaultValues: {
        entity: customer
      }
    });
  };

  var _log = function _log(text) {
    log.audit({
      title: 'Creator',
      details: text
    });
  };

  var setInfo = function setInfo(invoice, newInfo) {
    var info = Object.assign({}, defaultInfo, newInfo);
    _log('setInfo: ' + JSON.stringify(info));
    for (var field in info) {
      if (info.hasOwnProperty(field)) {
        invoice.setValue({
          fieldId: field,
          value: info[field],
          ignoreFieldChange: true
        });
      }
    }
  };

  var addItem = function addItem(invoice, newItem) {
    var item = Object.assign({}, defaultItem, newItem);
    _log('addItem: ' + JSON.stringify(item));
    invoice.selectNewLine({ sublistId: 'item' });
    for (var field in item) {
      if (item.hasOwnProperty(field)) {
        invoice.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: field,
          value: item[field]
        });
      }
    }
    invoice.commitLine({ sublistId: 'item' });
  };

  var save = function save(invoice) {
    return invoice.save({
      enableSourcing: true,
      ignoreMandatoryFields: true
    });
  };

  return {
    onRequest: onRequest
  };
});