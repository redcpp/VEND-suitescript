'use strict';

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/file'], function (record, search, file) {
  var onRequest = function onRequest(context) {
    try {
      var method = context.request.method;
      var mode = context.request.parameters.custparam_mode;
      var vendRecordId = context.request.parameters.custparam_vendrecordid;
      var vendRecordFileId = context.request.parameters.custparam_vendrecordfileid;

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

  var updateCustomVendRecord = function updateCustomVendRecord(vendRecordId, invoiceId) {
    var id = record.submitFields({
      type: 'customrecord_vend_custom_record',
      id: vendRecordId,
      values: {
        custrecord_vend_id_netsuite_invoice: invoiceId
      },
      options: {
        enableSourcing: true,
        ignoreMandatoryFields: false
      }
    });
    log.audit({
      title: 'Submit fields',
      details: 'vendRecordId: ' + id
    });
  };

  var retrieveRecord = function retrieveRecord(vendRecordId) {
    // eslint-disable-line
    return search.lookupFields({
      type: 'customrecord_vend_custom_record',
      id: vendRecordId,
      columns: ['name', 'custrecord_vend_file', 'custrecord_vend_id_netsuite_invoice']
    });
  };

  return {
    onRequest: onRequest
  };
});