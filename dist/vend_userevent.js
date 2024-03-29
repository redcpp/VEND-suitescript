'use strict';

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget'], function (ui) {
  var beforeLoad = function beforeLoad(context) {
    if (recordHasValidConditions(context)) {
      var form = context.form;
      form.clientScriptModulePath = './vend_clientscript.js';

      form.addButton({
        id: 'custpage_btn_process',
        label: 'Create invoice',
        functionName: dynamicFunctionName(context.newRecord)
      });
    }
  };

  var dynamicFunctionName = function dynamicFunctionName(newRecord) {
    var id = newRecord.id;
    var fileId = newRecord.getValue('custrecord_vend_file');
    return 'processFile(' + id + ',' + fileId + ')';
  };

  var recordHasValidConditions = function recordHasValidConditions(context) {
    return context.type === context.UserEventType.VIEW && Boolean(context.newRecord.getValue('custrecord_vend_file')) && !Boolean(context.newRecord.getValue('custrecord_vend_id_netsuite_invoice'));
  };

  return {
    beforeLoad: beforeLoad
  };
});