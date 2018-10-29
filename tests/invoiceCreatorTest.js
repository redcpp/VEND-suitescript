const invoiceCreator = require('../src/invoiceCreator');

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
