/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error'], function(record, error) {
  function processSale(context) {
    try {
      var saleRecord = createRecord();
      setInfoOfRecord(context, saleRecord);
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

  function setInfoOfRecord(ctx, record) {
    var info = extractGeneralInfo(ctx);

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

  function extractGeneralInfo(ctx) {
    return {
      custrecord_vend_json: JSON.stringify(ctx),
    };
  }

  function extractItemInfo(ctxProduct) {
    return {
      item: 42,
      quantity: ctxProduct.quantity,
      tax_code: 5,
    }
  }

  return {
    post: processSale,
  };
});
