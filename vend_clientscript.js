define(['N/url', 'N/record'], function (url, r) {
  /**
  * Client Script to add a Button to Vend Custom Record
  *
  * @NApiVersion 2.x
  */
  var exports = {};

  function processFile(id) {
    log.audit({
      title: 'Click',
      details: id,
    });
  }

  exports.processFile = processFile;
  return exports;
});
