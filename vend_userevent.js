/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget'], function(ui) {
  function beforeLoad(context) {
    if (recordHasValidConditions(context)) {
      var form = context.form;
      form.clientScriptModulePath =  './vend_clientscript.js';

      form.addButton({
        id: 'custpage_btn_process',
        label: 'Process file info',
        functionName: dynamicFunctionName(context.newRecord),
      });
    }
  }

  function dynamicFunctionName(newRecord) {
    return (
      'processFile('
      + newRecord.id
      + ', '
      + newRecord.custrecord_vend_file
      + ')'
    );
  }

  function recordHasValidConditions(context) {
    return (context.type === context.UserEventType.VIEW
      && context.newRecord.custrecord_vend_file
      && !context.newRecord.custrecord_vend_id_netsuite_invoice);
  }

  return {
    beforeLoad: beforeLoad
  }
});
