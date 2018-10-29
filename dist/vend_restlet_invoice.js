'use strict';

/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error', 'N/file'], function (record, error, file) {
  var processSale = function processSale(context) {
    try {
      var saleRecord = createRecord();
      var fileId = createFile(context, file);
      setInfoOfRecord(context, fileId, saleRecord);
      var saleId = saveRecord(saleRecord);

      log.audit({
        title: 'Custom record upload - success',
        details: 'Custom record id: ' + saleId
      });
    } catch (error) {
      log.audit({
        title: 'Custom record upload - fail',
        details: error
      });
    }
  };

  var createRecord = function createRecord() {
    return record.create({
      type: 'customrecord_vend_custom_record'
    });
  };

  var createFile = function createFile(context, file) {
    var newFile = file.create({
      name: extractName(context) + '.json',
      fileType: file.Type.JSON,
      contents: JSON.stringify(context)
    });
    newFile.folder = 827;
    return newFile.save();
  };

  var setInfoOfRecord = function setInfoOfRecord(context, fileId, record) {
    var info = extractGeneralInfo(context, fileId);
    for (var field in info) {
      if (info.hasOwnProperty(field)) {
        record.setValue({
          fieldId: field,
          value: info[field],
          ignoreFieldChange: true
        });
      }
    }
  };

  var addItemToRecord = function addItemToRecord(ctxProduct, record) {
    // eslint-disable-line
    record.selectNewLine({ sublistId: 'item' });

    var item = extractItemInfo(ctxProduct);
    for (var field in item) {
      if (item.hasOwnProperty(field)) {
        record.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: field,
          value: item[field]
        });
      }
    }

    record.commitLine({ sublistId: 'item' });
  };

  var saveRecord = function saveRecord(record) {
    return record.save({
      enableSourcing: true,
      ignoreMandatoryFields: true
    });
  };

  var extractGeneralInfo = function extractGeneralInfo(context, fileId) {
    return {
      name: extractName(context),
      custrecord_vend_json: JSON.stringify(context),
      custrecord_vend_file: fileId
    };
  };

  var extractItemInfo = function extractItemInfo(ctxProduct) {
    return {
      item: 42,
      quantity: ctxProduct.quantity,
      tax_code: 5
    };
  };

  var extractName = function extractName(context) {
    return context.payload.invoice_number;
  };

  return {
    post: processSale
  };
});