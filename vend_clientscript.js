define(['N/url', 'N/record'], function (url, r) {
  /**
  * Client Script to add a Button to Vend Custom Record
  *
  * @NApiVersion 2.x
  */
  var exports = {};

  function processFile(vendRecordId, vendRecordFileId) {
    try {
      var suitletUrl = url.resolveScript({
        scriptId: 'customscript_vend_suitelet',
        deploymentId: 'customdeploy_vend_suitelet',
      });

      suitletUrl += '&custparam_vendrecordid=' + vendRecordId;
      suitletUrl += '&custparam_vendrecordfileid=' + vendRecordFileId;
      suitletUrl += '&custparam_mode=createinvoice';

      fetch(suitletUrl);
    } catch (error) {
      log.audit({
        title: 'Clientscript error',
        details: error,
      });
    }
  }

  exports.processFile = processFile;
  return exports;
});
