'use strict';

var invoiceCreator = function invoiceCreator(record) {
  // eslint-disable-line
  var defaultInfo = {
    subsidiary: 2,
    location: 4,
    custbody_efx_pos_origen: true,
    memo: 'go_invoice_test',
    approvalstatus: 1
  };

  var defaultItem = {
    item: 42,
    quantity: 2,
    tax_code: 5
  };

  var log = function log(text) {
    if (process.env.REDCPP) {
      console.log(text);
    } else {
      log.audit({
        title: 'Creator',
        details: text
      });
    }
  };

  var create = function create(customer) {
    return record.create({
      type: record.Type.INVOICE,
      isDynamic: true,
      defaultValues: {
        entity: customer
      }
    });
  };

  var setInfo = function setInfo(newInfo) {
    var info = Object.assign({}, defaultInfo, newInfo);
    for (var field in info) {
      if (info.hasOwnProperty(field)) {
        record.setValue({
          fieldId: field,
          value: info[field],
          ignoreFieldChange: true
        });
      }
    }
  };

  var addItem = function addItem(newItem) {
    var item = Object.assign({}, defaultItem, newItem);
    record.selectNewLine({ sublistId: 'item' });
    for (var field in item) {
      if (item.hasOwnProperty(field)) {
        record.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: field,
          value: item[field]
        });
      }
    }
  };

  var save = function save() {
    return record.save({
      enableSourcing: true,
      ignoreMandatoryFields: true
    });
  };

  return {
    create: create,
    setInfo: setInfo,
    addItem: addItem,
    save: save
  };
};

module.exports = exports = invoiceCreator;