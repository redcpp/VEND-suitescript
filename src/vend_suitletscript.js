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

      const to = Object(target);

      for (let index = 1; index < arguments.length; index++) {
        // eslint-disable-line
        const nextSource = arguments[index]; // eslint-disable-line

        if (nextSource != null) {
          // Skip over if undefined or null
          for (const nextKey in nextSource) {
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
    configurable: true,
  });
}

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/file'], (record, search, file) => {
  const onRequest = (context) => {
    try {
      const method = context.request.method;
      const mode = context.request.parameters.custparam_mode;
      const vendRecordId = context.request.parameters.custparam_vendrecordid;
      const vendRecordFileId = context.request.parameters.custparam_vendrecordfileid;

      if (mode === 'createinvoice' && method === 'GET') {
        createInvoice(vendRecordId, vendRecordFileId);
      } else {
        logModeUndefined();
      }
    } catch (error) {
      logError(error);
    }
  };

  /*
  **********************************************************************************
  * CreateInvoice
  **********************************************************************************
  */

  const createInvoice = (vendRecordId, vendRecordFileId) => {
    const fileContents = retrieveFileContents(vendRecordFileId);
    const info = obtainInfo(fileContents);
    const items = obtainProducts(fileContents.payload.register_sale_products);
    log.audit({
      title: 'params',
      details: {
        recordId: vendRecordId,
        fileId: vendRecordFileId,
      },
    });
    log.audit({title: 'info', details: info});
    log.audit({title: 'items', details: items});
    const invoiceId = createInvoiceRecord(items);
    updateCustomVendRecord(vendRecordId, invoiceId);
  };

  const updateCustomVendRecord = (vendRecordId, invoiceId) => {
    const id = record.submitFields({
      type: 'customrecord_vend_custom_record',
      id: vendRecordId,
      values: {
        custrecord_vend_id_netsuite_invoice: invoiceId,
      },
      options: {
        enableSourcing: true,
        ignoreMandatoryFields: false,
      },
    });
    log.audit({
      title: 'Submit fields',
      details: 'vendRecordId: ' + id,
    });
  };

  const retrieveRecord = (vendRecordId) => { // eslint-disable-line
    return search.lookupFields({
      type: 'customrecord_vend_custom_record',
      id: vendRecordId,
      columns: [
        'name',
        'custrecord_vend_file',
        'custrecord_vend_id_netsuite_invoice',
      ],
    });
  };

  const retrieveFileContents = (fileId) => {
    const fileObj = file.load({id: fileId});
    return JSON.parse(fileObj.getContents());
  };

  const obtainInfo = (sale) => {
    return {};
  };

  const obtainProducts = (products) => {
    const skuList = products.map(function(product) {
      return product.sku;
    });
    const localInfoOfSku = searchProducts(skuList);
    const productsWithAllInfo = products
      .map((product) => Object.assign({}, product, localInfoOfSku[product.sku]))
      .filter((product) => product.internal_id);
    return productsWithAllInfo;
  };

  const searchProducts = (skuList) => {
    log.audit({
      title: 'Sku list',
      details: skuList,
    });
    const searchOperation = search.create({
      type: search.Type.INVENTORY_ITEM,
      filters: [
        ['isinactive', search.Operator.IS, 'F'],
        'and',
        ['externalid', search.Operator.ANYOF, skuList],
      ],
      columns: [{name: 'itemid', name: 'externalid'}],
    });
    const searchData = searchOperation.run();

    const productDict = traverseSearchData(searchData);
    return productDict;
  };

  const traverseSearchData = (searchData) => {
    const CHUNK_SIZE = 1000;
    const dict = {};
    let i = 0;

    do {
      const chunk = searchData.getRange(i, i + CHUNK_SIZE);
      if (chunk && chunk.length) {
        for (let j = 0; j < chunk.length; ++j) {
          const product = obtainProduct(chunk[j]);
          if (!dict[product.sku]) {
            dict[product.sku] = product;
          }
        }
      }
      i += CHUNK_SIZE;
    } while (i < searchData.length);

    return dict;
  };

  const obtainProduct = (product) => {
    return {
      internal_id: parseInt(product.id),
      internal_name: product.getValue({name: 'itemid'}),
      sku: product.getValue({name: 'externalid'}),
    };
  };

  const createInvoiceRecord = (items) => {
    try {
      const creator = invoiceFactory({record, log, customer: 35});
      creator.setInfo({});
      items.forEach((item) => {
        creator.addItem({
          item: item.internal_id,
          quantity: item.quantity,
        });
      });
      const invoiceId = creator.save();
      logInvoiceSuccess(invoiceId);
      return invoiceId;
    } catch (error) {
      logInvoiceError(error);
    }
  };

  /*
  **********************************************************************************
  * Loggers
  **********************************************************************************
  */

  const logModeUndefined = () => {
    log.audit({
      title: 'Request failed',
      details: 'Mode not defined',
    });
  };

  const logError = (error) => {
    log.audit({
      title: 'Request failed',
      details: error,
    });
  };

  const logInvoiceSuccess = (invoiceId) => {
    log.audit({
      title: 'Invoice - success',
      details: 'Invoice id: ' + invoiceId,
    });
  };

  const logInvoiceError = (error) => {
    log.audit({
      title: 'Invoice - fail',
      details: error,
    });
  };

  /*
  **********************************************************************************
  * Main Return
  **********************************************************************************
  */

  return {
    onRequest: onRequest,
  };
});

/*
**********************************************************************************
* Utilities
**********************************************************************************
*/

const invoiceFactory = ({record, log, customer}) => {
  const defaultInfo = {
    subsidiary: 2,
    location: 4,
    custbody_efx_pos_origen: true,
    memo: 'go_invoice_test',
    approvalstatus: 1,
  };

  const defaultItem = {
    item: 42,
    quantity: 2,
    tax_code: 5,
  };

  const invoice = record.create({
    type: record.Type.INVOICE,
    isDynamic: true,
    defaultValues: {
      entity: customer,
    },
  });

  const _log = function(text) {
    log.audit({
      title: 'Creator',
      details: text,
    });
  };

  return {
    setInfo(newInfo) {
      const info = Object.assign({}, defaultInfo, newInfo);
      _log(`setInfo: ${JSON.stringify(info)}`);
      for (const field in info) {
        if (info.hasOwnProperty(field)) {
          invoice.setValue({
            fieldId: field,
            value: info[field],
            ignoreFieldChange: true,
          });
        }
      }
    },

    addItem(newItem) {
      const item = Object.assign({}, defaultItem, newItem);
      _log(`addItem: ${JSON.stringify(item)}`);
      invoice.selectNewLine({sublistId: 'item'});
      for (const field in item) {
        if (item.hasOwnProperty(field)) {
          invoice.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: field,
            value: item[field],
          });
        }
      }
      invoice.commitLine({sublistId: 'item'});
    },

    save() {
      return invoice.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });
    },
  };
};
