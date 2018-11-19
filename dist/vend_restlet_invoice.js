'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error', 'N/file', 'N/search'], function (record, error, file, search) {
  var processSale = function processSale(jsonContents) {
    try {
      var customRecordId = createCustomRecord(jsonContents); // eslint-disable-line

      var items = obtainProducts(jsonContents.payload.register_sale_products);
      var invoiceId = createInvoiceRecord(items);

      updateCustomRecord(customRecordId, invoiceId);
    } catch (error) {
      logError(error);
    }
  };

  /*
  **********************************************************************************
  * Invoice
  **********************************************************************************
  */

  var obtainProducts = function obtainProducts(products) {
    var skuList = products.map(function (product) {
      return product.sku;
    });
    var localInfoOfSku = searchProducts(skuList);
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

  var createInvoiceRecord = function createInvoiceRecord(items) {
    try {
      var creator = invoiceFactory({ record: record, log: log, customer: 35 });
      creator.setInfo({});
      items.forEach(function (item) {
        creator.addItem({
          item: item.internal_id,
          quantity: item.quantity
        });
      });
      var invoiceId = creator.save();
      logInvoiceSuccess(invoiceId);
      return invoiceId;
    } catch (error) {
      logInvoiceError(error);
    }
  };

  /*
  **********************************************************************************
  * Custom Record
  **********************************************************************************
  */

  var createCustomRecord = function createCustomRecord(jsonContents) {
    try {
      var fileId = createFile(jsonContents);

      var creator = customRecordFactory({ record: record, log: log });
      creator.setInfo({
        name: extractName(jsonContents),
        custrecord_vend_json: JSON.stringify(jsonContents),
        custrecord_vend_file: fileId
      });
      var customRecordId = creator.save();

      logCustomRecordSuccess(customRecordId);
      return customRecordId;
    } catch (error) {
      logCustomRecordError(error);
    }
  };

  var createFile = function createFile(fileContents) {
    var newFile = file.create({
      name: extractName(fileContents) + '.json',
      fileType: file.Type.JSON,
      contents: JSON.stringify(fileContents)
    });
    newFile.folder = 827;
    return newFile.save();
  };

  var extractName = function extractName(context) {
    return context.payload.invoice_number;
  };

  var updateCustomRecord = function updateCustomRecord(customRecordId, invoiceId) {
    var editedRecordId = record.submitFields({
      type: 'customrecord_vend_custom_record',
      id: customRecordId,
      values: {
        custrecord_vend_id_netsuite_invoice: invoiceId
      },
      options: {
        enableSourcing: true,
        ignoreMandatoryFields: false
      }
    });
    logUpdateSuccess(editedRecordId);
  };

  /*
  **********************************************************************************
  * Loggers
  **********************************************************************************
  */

  var logCustomRecordSuccess = function logCustomRecordSuccess(customRecordId) {
    log.audit({
      title: 'Custom record - success',
      details: 'Custom record id: ' + customRecordId
    });
  };
  var logCustomRecordError = function logCustomRecordError(error) {
    log.audit({
      title: 'Custom record - fail',
      details: error
    });
  };
  var logInvoiceSuccess = function logInvoiceSuccess(invoiceId) {
    log.audit({
      title: 'Invoice - success',
      details: 'Invoice id: ' + invoiceId
    });
  };
  var logInvoiceError = function logInvoiceError(error) {
    log.audit({
      title: 'Invoice - fail',
      details: error
    });
  };
  var logUpdateSuccess = function logUpdateSuccess(customRecordId) {
    log.audit({
      title: 'Update - success',
      details: 'Custom record id: ' + customRecordId
    });
  };
  var logError = function logError(error) {
    log.audit({
      title: 'Restlet -fail',
      details: error
    });
  };

  /*
  **********************************************************************************
  * Main Return
  **********************************************************************************
  */

  return {
    post: processSale
  };
});

/*
**********************************************************************************
* Utilities
**********************************************************************************
*/

var _setInfo = function _setInfo(createdRecord, info) {
  for (var field in info) {
    if (info.hasOwnProperty(field)) {
      createdRecord.setValue({
        fieldId: field,
        value: info[field],
        ignoreFieldChange: true
      });
    }
  }
};

var _addItem = function _addItem(createdRecord, item) {
  createdRecord.selectNewLine({ sublistId: 'item' });
  for (var field in item) {
    if (item.hasOwnProperty(field)) {
      createdRecord.setCurrentSublistValue({
        sublistId: 'item',
        fieldId: field,
        value: item[field]
      });
    }
  }
  createdRecord.commitLine({ sublistId: 'item' });
};

var _save = function _save(createdRecord) {
  return createdRecord.save({
    enableSourcing: true,
    ignoreMandatoryFields: true
  });
};

var customRecordFactory = function customRecordFactory(_ref2) {
  var record = _ref2.record,
      log = _ref2.log;

  var defaultInfo = {};
  var customRecord = record.create({
    type: 'customrecord_vend_custom_record'
  });
  var _log = function _log(text) {
    log.audit({ title: 'Custom Record Factory', details: text });
  };
  return {
    setInfo: function setInfo(newInfo) {
      var info = Object.assign({}, defaultInfo, newInfo);
      _log('setInfoOf: ' + info.name);
      _setInfo(customRecord, info);
    },
    save: function save() {
      return _save(customRecord);
    }
  };
};

var invoiceFactory = function invoiceFactory(_ref3) {
  var record = _ref3.record,
      log = _ref3.log,
      customer = _ref3.customer;

  var defaultInfo = {
    subsidiary: 2,
    location: 4,
    custbody_efx_pos_origen: true,
    memo: 'go_invoice_test',
    approvalstatus: 1
  };
  var defaultItem = {
    tax_code: 5
  };
  var invoice = record.create({
    type: record.Type.INVOICE,
    isDynamic: true,
    defaultValues: {
      entity: customer
    }
  });
  var _log = function _log(text) {
    log.audit({ title: 'Invoice Factory', details: text });
  };
  return {
    setInfo: function setInfo(newInfo) {
      var info = Object.assign({}, defaultInfo, newInfo);
      _log('setInfo: ' + JSON.stringify(info));
      _setInfo(invoice, info);
    },
    addItem: function addItem(newItem) {
      var item = Object.assign({}, defaultItem, newItem);
      _log('addItem: ' + JSON.stringify(item));
      _addItem(invoice, item);
    },
    save: function save() {
      return _save(invoice);
    }
  };
};

if (typeof Object.assign != 'function') {
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, constArgs) {
      'use strict';

      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        // eslint-disable-line
        var nextSource = arguments[index]; // eslint-disable-line
        if (nextSource != null) {
          for (var nextKey in nextSource) {
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