/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget'], (ui) => {
  const beforeLoad = (context) => {
    if (recordHasValidConditions(context)) {
      const form = context.form;
      form.clientScriptModulePath = './vend_clientscript.js';

      form.addButton({
        id: 'custpage_btn_process',
        label: 'Create invoice',
        functionName: dynamicFunctionName(context.newRecord),
      });
    }
  };

  const dynamicFunctionName = (newRecord) => {
    const id = newRecord.id;
    const fileId = newRecord.getValue('custrecord_vend_file');
    return `processFile(${id},${fileId})`;
  };

  const recordHasValidConditions = (context) => {
    return (
      context.type === context.UserEventType.VIEW &&
      Boolean(context.newRecord.getValue('custrecord_vend_file')) &&
      !Boolean(context.newRecord.getValue('custrecord_vend_id_netsuite_invoice'))
    );
  };

  return {
    beforeLoad: beforeLoad,
  };
});
