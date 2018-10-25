/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/file'], function(record, search, file) {
  function onRequest(context) {
    try {
      var method = context.request.method;
      var mode = context.request.parameters.custparam_mode;
      var vendRecordId = context.request.parameters.custparam_vendrecordid;
      var vendRecordFileId = context.request.parameters.custparam_vendrecordfileid;

      if (mode === 'createinvoice' && method === 'GET') createInvoice(vendRecordId, vendRecordFileId);
      else logModeUndefined();
    } catch (error) {
      log.audit({
        title: 'Request failed',
        details: error
      });
    }
  }

  function createInvoice(vendRecordId, vendRecordFileId) {
    var vendRecord = retrieveRecord(vendRecordId);
    var fileContents = retrieveFileContents(vendRecordFileId);
    var info = obtainInfo(fileContents);
    var items = obtainProducts(fileContents.payload.register_sale_products);
    log.audit({
      title: 'items',
      details: items,
    });
  }

  function retrieveRecord(vendRecordId) {
    return search.lookupFields({
      type: 'customrecord_vend_custom_record',
      id: vendRecordId,
      columns: [
        'name',
        'custrecord_vend_file',
        'custrecord_vend_id_netsuite_invoice'
      ],
    });
  }

  function retrieveFileContents(fileId) {
    var fileObj = file.load({id: fileId});
    return JSON.parse(fileObj.getContents());
  }

  function obtainInfo(sale) {
    return {
      customer: null,
      taxCode: null,
      location: null,
      subsidiary: null,
    };
  }

  function obtainProducts(products) {
    var skuList = products.map(function (product) {
      return product.sku
    });
    return searchProducts(skuList);
  }

  function searchProducts(skuList) {
    log.audit({
      title: 'Sku list',
      details: skuList,
    });
    var searchOperation = search.create({
      type: search.Type.INVENTORY_ITEM,
      filters: [
        ['isinactive', search.Operator.IS, 'F'],
        'and',
        ['externalid', search.Operator.ANYOF, skuList],
      ],
      columns: [{name: 'itemid'}],
    });
    var searchData = searchOperation.run();

    var set = {};
    var products = [];
    var CHUNK_SIZE = 1000;
    i = 0;
    do {
      var chunk = searchData.getRange(i, i + CHUNK_SIZE);
      if (chunk && chunk.length) {
        for (var i = 0; i < chunk.length; ++i) {
          var product = extractProduct(chunk[i]);
          if (!set[product.id]) {
            set[product.id] = true;
            products.push(product);
          }
        }
      }
      i += CHUNK_SIZE;
    } while (i < searchData.length);

    return products;
  }

  function extractProduct(product) {
    return {
      id: product.id,
      name: product.getValue({name:'itemid'}),
    };
  }

  function logModeUndefined() {
    log.audit({
      title: 'Request failed',
      details: 'Mode not defined'
    });
  }

  return {
    onRequest: onRequest
  }
});
