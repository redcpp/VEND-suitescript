/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error'], function(record, error) {
  function post(context) {
    try {
      var saleRecord = createRecord(35);

      setInitialValues(saleRecord);
      addItemToRecord(null, saleRecord);

      var saleId = saveRecord();

      log.audit({
        title: 'Invoice upload - success',
        details: 'Invoice id:' + saleId
      });
    } catch (error) {
      log.audit({
        title: 'Invoice upload - fail',
        details: error
      });
    }
  }

  function createRecord(clientId) {
    return record.create({
      type: record.Type.INVOICE,
      isDynamic: true,
      defaultValues: {
        entity: clientId
      }
    });
  }

  function setInitialValues(saleRecord) {
    saleRecord.setValue({
      fieldId: 'subsidiary',
      value: 2,
      ignoreFieldChange: true
    }).setValue({
      fieldId: 'location',
      value: 4,
      ignoreFieldChange: true
    }).setValue({
      fieldId: 'custbody_efx_pos_origen',
      value: true,
      ignoreFieldChange: true
    }).setValue({
      fieldId: 'memo',
      value: 'go_test',
      ignoreFieldChange: true
    }).setValue({
      fieldId: 'approvalstatus',
      value: 1,
      ignoreFieldChange: true
    })
  }

  function addItemToRecord(item, saleRecord) {
    saleRecord.selectNewLine({sublistId:'item'});
    saleRecord.setCurrentSublistValue({
        sublistId: 'item',
        fieldId: 'item',
        value: 42
    }).setCurrentSublistValue({
        sublistId: 'item',
        fieldId: 'quantity',
        value: 2
    }).setCurrentSublistValue({
        sublistId: 'item',
        fieldId: 'tax_code',
        value: 5
    });
    saleRecord.commitLine({sublistId:'item'});
  }

  function saveRecord() {
    return saleRecord.save({
      enableSourcing: true,
      ignoreMandatoryFields: true
    });
  }

  return {
    post: post
  };
});
