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
    var info = obtainInfo();
  }

  function retrieveRecord() {
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
    var fileObj = file.load({
      id: fileId,
    });
    return JSON.parse(fileObj.getContents());
  }

  function obtainInfo() {
    return {
      items: null,
      customer: null,
      taxCode: null,
      location: null,
      subsidiary: null,
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
