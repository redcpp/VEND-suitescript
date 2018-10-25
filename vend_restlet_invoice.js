/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error', 'N/file'], function(record, error, file) {
  function processSale(context) {
    try {
      var saleRecord = createRecord();
      var fileId = createFile(context, file);
      setInfoOfRecord(context, fileId, saleRecord);
      var saleId = saveRecord(saleRecord);

      log.audit({
        title: 'Custom record upload - success',
        details: 'Custom record id: ' + saleId,
      });
    } catch (error) {
      log.audit({
        title: 'Custom record upload - fail',
        details: error,
      });
    }
  }

  function createRecord() {
    return record.create({
      type: 'customrecord_vend_custom_record',
    });
  }

  function createFile(context, file) {
    var newFile = file.create({
      name: extractName(context) + '.json',
      fileType: file.Type.JSON,
      contents: JSON.stringify(context),
    });
    newFile.folder = 827;
    return newFile.save();
  }

  function setInfoOfRecord(context, fileId, record) {
    var info = extractGeneralInfo(context, fileId);

    for (var field in info) {
      record.setValue({
        fieldId: field,
        value: info[field],
        ignoreFieldChange: true,
      });
    }
  }

  function addItemToRecord(ctxProduct, record) {
    record.selectNewLine({sublistId:'item'});

    var item = extractItemInfo(ctxProduct);
    for (var field in item) {
      record.setCurrentSublistValue({
        sublistId: 'item',
        fieldId: field,
        value: item[field],
      });
    }

    record.commitLine({sublistId:'item'});
  }

  function saveRecord(record) {
    return record.save({
      enableSourcing: true,
      ignoreMandatoryFields: true,
    });
  }

  function extractGeneralInfo(context, fileId) {
    return {
      name: extractName(context),
      custrecord_vend_json: JSON.stringify(context),
      custrecord_vend_file: fileId,
    };
  }

  function extractItemInfo(ctxProduct) {
    return {
      item: 42,
      quantity: ctxProduct.quantity,
      tax_code: 5,
    }
  }

  function extractName(context) {
    return context.payload.invoice_number
  }

  return {
    post: processSale,
  };
});
