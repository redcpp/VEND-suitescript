/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error'], function(record, error) {
  function processSale(context) {
    try {
      var saleRecord = createRecord();
      setInfoOfRecord({content: context}, saleRecord);
      var saleId = saveRecord(saleRecord);

      log.audit({
        title: 'Invoice upload - success',
        details: 'Invoice id: ' + saleId,
      });
    } catch (error) {
      log.audit({
        title: 'Invoice upload - fail',
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
      subsidiary: 2,
      location: 4,
      custbody_efx_pos_origen: true,
      memo: 'go_invoice_test',
      approvalstatus: 1,
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
