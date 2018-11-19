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
      logError(error);
    }
  };

  /*
  **********************************************************************************
  * CreateInvoice
  **********************************************************************************
  */

  const updateCustomVendRecord = (vendRecordId, invoiceId) => {
    const id = record.submitFields({
      type: 'customrecord_vend_custom_record',
      id: vendRecordId,
      values: {
        custrecord_vend_id_netsuite_invoice: invoiceId,
      },
      options: {
        enableSourcing: true,
        ignoreMandatoryFields: false,
      },
    });
    log.audit({
      title: 'Submit fields',
      details: 'vendRecordId: ' + id,
    });
  };

  const retrieveRecord = (vendRecordId) => { // eslint-disable-line
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

  return {
    onRequest: onRequest,
  };
});
