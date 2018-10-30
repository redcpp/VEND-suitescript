const invoiceCreator = (record) => {
  const defaultInfo = {
    subsidiary: 2,
    location: 4,
    custbody_efx_pos_origen: true,
    memo: 'go_invoice_test',
    approvalstatus: 1,
  };

  const defaultItem = {
    item: 42,
    quantity: 2,
    tax_code: 5,
  };

  const log = function(text) {
    if (process.env.REDCPP) {
      console.log(text);
    } else {
      log.audit({
        title: 'Creator',
        details: text,
      });
    }
  };

  const create = function(customer) {
    return record.create({
      type: record.Type.INVOICE,
      isDynamic: true,
      defaultValues: {
        entity: customer,
      },
    });
  };

  const setInfo = function(newInfo) {
    const info = Object.assign({}, defaultInfo, newInfo);
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

  const addItem = function(newItem) {
    const item = Object.assign({}, defaultItem, newItem);
    record.selectNewLine({sublistId: 'item'});
    for (const field in item) {
      if (item.hasOwnProperty(field)) {
        record.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: field,
          value: item[field],
        });
      }
    }
  };

  const save = function() {
    return record.save({
      enableSourcing: true,
      ignoreMandatoryFields: true,
    });
  };

  return {
    create: create,
    setInfo: setInfo,
    addItem: addItem,
    save: save,
  };
};

const record = {
  create: function(obj) {console.log('create', obj)},
  setValue: function(obj) {console.log('setValue', obj)},
  selectNewLine: function(obj) {console.log('selectNewLine', obj)},
  setCurrentSublistValue: function(obj) {console.log('setCurrentSublistValue', obj)},
  save: function(obj) {console.log('save', obj)},
  Type: {},
};

const invoice = invoiceCreator(record);
invoice.create(35);
console.log();
invoice.setInfo({location: 500});
console.log();
invoice.addItem({quantity: 100});
console.log();
invoice.save();
