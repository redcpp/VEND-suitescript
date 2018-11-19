/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error', 'N/file', 'N/search'], (record, error, file, search) => { // eslint-disable-line max-len
  const processSale = (jsonContents) => {
    try {
      const customRecordId = createCustomRecord(jsonContents); // eslint-disable-line

      const items = obtainProducts(jsonContents.payload.register_sale_products);
      const invoiceId = createInvoiceRecord(items);

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
  * Custom Record
  **********************************************************************************
  */

  const createCustomRecord = (jsonContents) => {
    try {
      const fileId = createFile(jsonContents);

      const creator = customRecordFactory({record, log});
      creator.setInfo({
        name: extractName(jsonContents),
        custrecord_vend_json: JSON.stringify(jsonContents),
        custrecord_vend_file: fileId,
      });
      const customRecordId = creator.save();

      logCustomRecordSuccess(customRecordId);
      return customRecordId;
    } catch (error) {
      logCustomRecordError(error);
    }
  };

  const createFile = (fileContents) => {
    const newFile = file.create({
      name: extractName(fileContents) + '.json',
      fileType: file.Type.JSON,
      contents: JSON.stringify(fileContents),
    });
    newFile.folder = 827;
    return newFile.save();
  };

  const extractName = (context) => {
    return context.payload.invoice_number;
  };

  const updateCustomRecord = (customRecordId, invoiceId) => {
    const editedRecordId = record.submitFields({
      type: 'customrecord_vend_custom_record',
      id: customRecordId,
      values: {
        custrecord_vend_id_netsuite_invoice: invoiceId,
      },
      options: {
        enableSourcing: true,
        ignoreMandatoryFields: false,
      },
    });
    logUpdateSuccess(editedRecordId);
  };

  /*
  **********************************************************************************
  * Loggers
  **********************************************************************************
  */

  const logCustomRecordSuccess = (customRecordId) => {
    log.audit({
      title: 'Custom record - success',
      details: 'Custom record id: ' + customRecordId,
    });
  };
  const logCustomRecordError = (error) => {
    log.audit({
      title: 'Custom record - fail',
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
  const logUpdateSuccess = (customRecordId) => {
    log.audit({
      title: 'Update - success',
      details: 'Custom record id: ' + customRecordId,
    });
  };
  const logError = (error) => {
    log.audit({
      title: 'Restlet -fail',
      details: error,
    });
  };

  /*
  **********************************************************************************
  * Main Return
  **********************************************************************************
  */

  return {
    post: processSale,
  };
});

/*
**********************************************************************************
* Utilities
**********************************************************************************
*/

const setInfo = (createdRecord, info) => {
  for (const field in info) {
    if (info.hasOwnProperty(field)) {
      createdRecord.setValue({
        fieldId: field,
        value: info[field],
        ignoreFieldChange: true,
      });
    }
  }
};

const addItem = (createdRecord, item) => {
  createdRecord.selectNewLine({sublistId: 'item'});
  for (const field in item) {
    if (item.hasOwnProperty(field)) {
      createdRecord.setCurrentSublistValue({
        sublistId: 'item',
        fieldId: field,
        value: item[field],
      });
    }
  }
  createdRecord.commitLine({sublistId: 'item'});
};

const save = (createdRecord) => {
  return createdRecord.save({
    enableSourcing: true,
    ignoreMandatoryFields: true,
  });
};

const customRecordFactory = ({record, log}) => {
  const defaultInfo = {};
  const customRecord = record.create({
    type: 'customrecord_vend_custom_record',
  });
  const _log = function(text) {
    log.audit({title: 'Custom Record Factory', details: text});
  };
  return {
    setInfo: (newInfo) => {
      const info = Object.assign({}, defaultInfo, newInfo);
      _log(`setInfoOf: ${info.name}`);
      setInfo(customRecord, info);
    },
    save: () => save(customRecord),
  };
};

const invoiceFactory = ({record, log, customer}) => {
  const defaultInfo = {
    subsidiary: 2,
    location: 4,
    custbody_efx_pos_origen: true,
    memo: 'go_invoice_test',
    approvalstatus: 1,
  };
  const defaultItem = {
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
    log.audit({title: 'Invoice Factory', details: text});
  };
  return {
    setInfo: (newInfo) => {
      const info = Object.assign({}, defaultInfo, newInfo);
      _log(`setInfo: ${JSON.stringify(info)}`);
      setInfo(invoice, info);
    },
    addItem: (newItem) => {
      const item = Object.assign({}, defaultItem, newItem);
      _log(`addItem: ${JSON.stringify(item)}`);
      addItem(invoice, item);
    },
    save: () => save(invoice),
  };
};


if (typeof Object.assign != 'function') {
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, constArgs) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      const to = Object(target);
      for (let index = 1; index < arguments.length; index++) {
        // eslint-disable-line
        const nextSource = arguments[index]; // eslint-disable-line
        if (nextSource != null) {
          for (const nextKey in nextSource) {
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
