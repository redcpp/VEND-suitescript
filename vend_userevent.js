/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget'], function(ui) {
  function beforeLoad(context) {
    if (context.type === context.UserEventType.VIEW) {
      var form = context.form;
      form.clientScriptModulePath =  './vend_clientscript.js';

      form.addButton({
        id: 'custpage_btn_process',
        label: 'Process file info',
        functionName: 'processFile(' + context.newRecord.id + ')',
      })
    }
  }

  return {
    beforeLoad: beforeLoad
  }
});
