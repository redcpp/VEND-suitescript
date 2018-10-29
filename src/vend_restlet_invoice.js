/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error', 'N/file'], (record, error, file) => {
  const processSale = (context) => {
    try {
      const saleRecord = createRecord();
      const fileId = createFile(context, file);
      setInfoOfRecord(context, fileId, saleRecord);
      const saleId = saveRecord(saleRecord);

      log.audit({
        title: 'Custom record upload - success',
        details: 'Custom record id: ' + saleId,
      });
    } catch (error) {
      log.audit({
        title: 'Custom record upload - fail',
        details: error,
      });
    }
  };

  const createRecord = () => {
    return record.create({
      type: 'customrecord_vend_custom_record',
    });
  };

  const createFile = (context, file) => {
    const newFile = file.create({
      name: extractName(context) + '.json',
      fileType: file.Type.JSON,
      contents: JSON.stringify(context),
    });
    newFile.folder = 827;
    return newFile.save();
  };

  const setInfoOfRecord = (context, fileId, record) => {
    const info = extractGeneralInfo(context, fileId);
    for (const field in info) {
      if (info.hasOwnProperty(field)) {
        record.setValue({
          fieldId: field,
          value: info[field],
          ignoreFieldChange: true,
        });
      }
    }
  };

  const addItemToRecord = (ctxProduct, record) => { // eslint-disable-line
    record.selectNewLine({sublistId: 'item'});

    const item = extractItemInfo(ctxProduct);
    for (const field in item) {
      if (item.hasOwnProperty(field)) {
        record.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: field,
          value: item[field],
        });
      }
    }

    record.commitLine({sublistId: 'item'});
  };

  const saveRecord = (record) => {
    return record.save({
      enableSourcing: true,
      ignoreMandatoryFields: true,
    });
  };

  const extractGeneralInfo = (context, fileId) => {
    return {
      name: extractName(context),
      custrecord_vend_json: JSON.stringify(context),
      custrecord_vend_file: fileId,
    };
  };

  const extractItemInfo = (ctxProduct) => {
    return {
      item: 42,
      quantity: ctxProduct.quantity,
      tax_code: 5,
    };
  };

  const extractName = (context) => {
    return context.payload.invoice_number;
  };

  return {
    post: processSale,
  };
});
