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
      log.audit({
        title: 'Request failed',
        details: error,
      });
    }
  };

  /*
  **********************************************************************************
  * CreateInvoice
  **********************************************************************************
  */

  const createInvoice = (vendRecordId, vendRecordFileId) => {
    const vendRecord = retrieveRecord(vendRecordId); // eslint-disable-line
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
  };

  const retrieveRecord = (vendRecordId) => {
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
    log.audit({title: 'localInfoOfSku', details: localInfoOfSku});
    const productsWithAllInfo = products.map(function(product) {
      return Object.assign({}, product, localInfoOfSku[product.sku]);
    });
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
    // eslint-disable-line
    return {
      internal_id: product.id,
      internal_name: product.getValue({name: 'itemid'}),
      sku: product.getValue({name: 'externalid'}),
    };
  };

  const logModeUndefined = () => {
    log.audit({
      title: 'Request failed',
      details: 'Mode not defined',
    });
  };

  return {
    onRequest: onRequest,
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
