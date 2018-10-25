/*******************************************************************
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * Name: EFX_POS_VUE_INVOICE_SL.js
 *
 * Author: Efficientix Dev Team
 * Purpose: All stuff related to pos vue Invoice (CRUD)
 * Script: customscript_efx_pos_vue_invoice_sl
 * Deploy: customdeploy_efx_pos_vue_invoice_sl
 * ******************************************************************* */

define(['N/search', 'N/log', 'N/record', 'N/url', 'N/https', 'N/render', 'N/file', 'N/runtime'], function (search, log, record, url, https, render, file, runtime) {
  var section = ''
  function onRequest(context) {
    try {
      log.audit({ title: 'context.request.method', details: context.request.method })
      if (context.request.method == 'GET') {
        var responseObj = {
          StatusCode: '',
          Message: '',
          Result: {}
        }

        log.audit({ title: 'GET Request', details: context.request })
        log.audit({ title: 'GET Response', details: context.response })

        try {

          section = 'Get Parameters'
          {
            log.audit({ title: 'context.request.parameters', details: JSON.stringify(context.request.parameters) });
            var custparam_mode = context.request.parameters.custparam_mode || '';
            var custparam_customer = context.request.parameters.custparam_customer || '';
            var custparam_subsidiary = context.request.parameters.custparam_subsidiary || '';
            var custparam_location = context.request.parameters.custparam_location || '';
            var custparam_memo = context.request.parameters.custparam_memo || '';
            var custparam_discauntglb = context.request.parameters.custparam_discauntglb || '';
            var custparam_items = context.request.parameters.custparam_items || '';
            var custparam_payment = context.request.parameters.custparam_payment || '';
            var custparam_invoice = context.request.parameters.custparam_invoice || '';
            var custparam_forma = context.request.parameters.custparam_forma || '';
            var custparam_metodo = context.request.parameters.custparam_metodo || '';
            var custparam_cfdi = context.request.parameters.custparam_cfdi || '';
            var custparam_createdby = context.request.parameters.custparam_createdby || '';

            var custparam_timbrar = context.request.parameters.custparam_payment || false;

            if (custparam_items) {
              custparam_items = JSON.parse(custparam_items);
            }
            if (custparam_payment) {
              custparam_payment = JSON.parse(custparam_payment);
            }
          }

          section = 'Get Data - Mode: ' + custparam_mode
          {
            switch (custparam_mode) {
              case 'url':
                /*
                  &custparam_mode=url&custparam_invoice=964
                */

                var urlTket = createUrlCliente(custparam_invoice);
                if (urlTket) {
                  responseObj.Result = urlTket;
                  responseObj.Message += ' Se obtuvo Link del tiket!';
                  responseObj.StatusCode = 2;

                } else {
                  responseObj.Message += ' Error con link del tiket!';
                  responseObj.StatusCode = 3;
                }
                log.audit({ title: 'urlTket', details: JSON.stringify(urlTket) });
                break
              case 'timbrar':
                /*
                  custparam_mode=timbrar&custparam_invoice=1000
                */

                var timbrarFactura = timbrarInvoice(custparam_invoice);
                if (timbrarFactura) {
                  responseObj.Result = timbrarFactura;
                  responseObj.Message += ' Se obtuvo Link para timbrar!';
                  responseObj.StatusCode = 2;

                } else {
                  responseObj.Message += ' Error con link para timbrar!';
                  responseObj.StatusCode = 3;
                }


                break
              case 'post':
                {
                  var custparam_forma = 1;
                  var custparam_metodo = 1;
                  var custparam_cfdi = 22;
                  var custparam_createdby = 2;
                  var custparam_discauntglb = 40;
                  var custparam_timbrar = true;
                  var custparam_mode = 'create';
                  var custparam_customer = 34;
                  var custparam_subsidiary = 2;
                  var custparam_location = 3;
                  var custparam_memo = 'Factura ejemplo';
                  var custparam_items = {
                    "i1": {
                      "id": "42",
                      "quantity": "2",
                      "tax_code": "5",
                      "priceLevel": "2",
                      "discount": {
                        "d1i1": {
                          "id": "40",
                          "tax_code": "5"
                        }
                      }
                    },
                    "i2": {
                      "id": "42",
                      "quantity": "1",
                      "tax_code": "5",
                      "priceLevel": "1",
                      "discount": {
                        "d1i2": {
                          "id": "40",
                          "tax_code": "5"
                        },
                        "d2i2": {
                          "id": "40",
                          "tax_code": "5"
                        }
                      }
                    }
                  };
                  var custparam_payment = {
                    "6": {
                      "id": "6",
                      "amount": "100"
                    },
                    "5": {
                      "id": "5",
                      "amount": "500"
                    }
                  };

                  var SLURL = url.resolveScript({
                    scriptId: 'customscript_efx_pos_vue_invoice_sl',
                    deploymentId: 'customdeploy_efx_pos_vue_invoice_sl',
                    returnExternalUrl: true
                  });

                  var objBody = {
                    custparam_forma: custparam_forma,
                    custparam_metodo: custparam_metodo,
                    custparam_cfdi: custparam_cfdi,
                    custparam_createdby: custparam_createdby,
                    custparam_discauntglb: custparam_discauntglb,
                    custparam_timbrar: custparam_timbrar,
                    custparam_mode: custparam_mode,
                    custparam_customer: custparam_customer,
                    custparam_subsidiary: custparam_subsidiary,
                    custparam_location: custparam_location,
                    custparam_memo: custparam_memo,
                    custparam_items: custparam_items,
                    custparam_payment: custparam_payment
                  };
                  var objBodyText = JSON.stringify(objBody);
                  log.audit({ title: 'objBodyText', details: objBodyText });
                  var headers = {
                    'Content-Type': 'application/json'
                  };

                  log.audit({ title: 'SLURL', details: SLURL });

                  var responseSL = https.request({
                    headers: headers,
                    method: https.Method.POST,
                    url: SLURL,
                    body: objBodyText
                  });

                  log.audit({ title: 'Response Code', details: responseSL.code });
                  log.audit({ title: 'Response Body', details: responseSL.body });

                  responseObj.StatusCode = 2
                  responseObj.Result = responseSL.body
                }
                break
              case 'information':
                {
                  // &custparam_mode=information&custparam_subsidiary=2

                  var objRetun = {
                    discount: {},
                    satFormaPago: {},
                    satMetodoPago: {},
                    satUsoCfdi: {}
                  };

                  objRetun.discount = getItemDiscount(custparam_subsidiary);

                  objRetun.satFormaPago = getFormaPago();
                  objRetun.satMetodoPago = getMEtodoPago();
                  objRetun.satUsoCfdi = getUsoCfdi();

                  if (Object.keys(objRetun.discount).length > 0) {
                    responseObj.Message += 'Descuentos obtenidos Correctamente!'
                  }
                  if (Object.keys(objRetun.satFormaPago).length > 0) {
                    responseObj.Message += 'Forma de Pago obtenidos Correctamente!'
                  }
                  if (Object.keys(objRetun.satMetodoPago).length > 0) {
                    responseObj.Message += 'Metodo de Pago obtenidos Correctamente!'
                  }
                  if (Object.keys(objRetun.satUsoCfdi).length > 0) {
                    responseObj.Message += 'Uso de CFDI obtenidos Correctamente!'
                  }



                  log.audit({ title: 'objRetun', details: JSON.stringify(objRetun) });
                  responseObj.StatusCode = 2
                  responseObj.Result = objRetun
                }
                break
              case 'obj':
                {
                  // &custparam_mode=information&custparam_customer=34&custparam_subsidiary=2

                  var objRetun = {
                    payment: {},
                    discount: {},
                    satFormaPago: {},
                    satMetodoPago: {},
                    satUsoCfdi: {},
                    defaultValues: {
                      satFormaPago: '',
                      satMetodoPago: '',
                      satUsoCfdi: ''
                    }
                  };

                  var informacionCliente = getDefaultValuesCustomer(custparam_customer);

                  objRetun.defaultValues.satFormaPago = informacionCliente.forma;
                  objRetun.defaultValues.satMetodoPago = informacionCliente.metodo;
                  objRetun.defaultValues.satUsoCfdi = informacionCliente.uso;

                  objRetun.payment = getData();
                  objRetun.discount = getItemDiscount(custparam_subsidiary);

                  objRetun.satFormaPago = getFormaPago();
                  objRetun.satMetodoPago = getMEtodoPago();
                  objRetun.satUsoCfdi = getUsoCfdi();

                  if (Object.keys(objRetun.payment).length > 0) {
                    responseObj.Message += 'Metodos de pago obtenidos Correctamente!'
                  }
                  if (Object.keys(objRetun.discount).length > 0) {
                    responseObj.Message += 'Articulos de descuento obtenidos Correctamente!'
                  }


                  log.audit({ title: 'objRetun', details: JSON.stringify(objRetun) });
                  responseObj.StatusCode = 2
                  responseObj.Result = objRetun
                }
                break

              case 'view':
                {
                  var result = getData()
                  responseObj.StatusCode = 2
                  responseObj.Message = 'Metodos de pago obtenidos Correctamente!'
                  responseObj.Result = result
                }
                break

                // case 'create':
                {
                  //   /*
                  //   &custparam_forma=1
                  //   &custparam_metodo=1
                  //   &custparam_cfdi=22
                  //   &custparam_createdby=2
                  //   &custparam_discauntglb=40&custparam_timbrar=true&custparam_mode=create&custparam_customer=34&custparam_subsidiary=2&custparam_location=3&custparam_memo='Factura ejemplo'&custparam_items={"i1": {"id": "42","quantity": "2","tax_code": "5","priceLevel": "2","discount": {"d1i1": {"id": "40","tax_code": "5"}}},"i2": {"id": "42","quantity": "1","tax_code": "5","priceLevel": "1","discount": {"d1i2": {"id": "40","tax_code": "5"},"d2i2": {"id": "40","tax_code": "5"}}}}&custparam_payment={"6": {"id": "6","amount": "100"},"5": {"id": "5","amount": "500"}}
                  //  */
                  //   var objRetun = {
                  //     idInvoice: 0,
                  //     urlTiquet: '',
                  //     urlSatTimbrar: ''/* ,
                  //     urlSatXml: '',
                  //     uuid: '' */
                  //   };

                  //   objRetun.idInvoice = createData(custparam_customer, custparam_subsidiary, custparam_location, custparam_memo, custparam_discauntglb, custparam_items, custparam_forma, custparam_metodo, custparam_cfdi, custparam_createdby);
                  //   if (parseInt(objRetun.idInvoice) > 0) {
                  //     responseObj.StatusCode = 2
                  //     responseObj.Message = 'Factura creada Correctamente!'
                  //     {//Crear metodos pago
                  //       var addPayment = createPayment(objRetun.idInvoice, custparam_payment);
                  //       if (addPayment) {
                  //         responseObj.Message += ' Metodos de pago agregados Correctamente!'
                  //       } else {
                  //         responseObj.Message += 'Error Metodo de pago!'
                  //       }

                  //     }
                  //     {//crear pdf cliente
                  //       objRetun.urlTiquet = createUrlCliente(objRetun.idInvoice);
                  //     }
                  //     {//crear URL de pdf y xml de sat
                  //       if (custparam_timbrar) {
                  //         var timbrarFactura = timbrarInvoice(objRetun.idInvoice);
                  //         var urlInvoice = getUrlInvoice(objRetun.idInvoice);
                  //         objRetun.urlSatPdf = urlInvoice.pdf;
                  //         objRetun.urlSatXml = urlInvoice.xml;
                  //         objRetun.uuid = urlInvoice.uuid;
                  //       }
                  //     }
                  //   }

                  //   log.audit({ title: 'objRetun', details: JSON.stringify(objRetun) });
                  //   responseObj.Result = objRetun;
                }
              // break

              default:
                responseObj.StatusCode = 3
                responseObj.Message = 'El parametro Mode está vacio!'

                break

            }
          }

          section = 'Print Result'
          {
            context.response.write(JSON.stringify(responseObj))
          }

        } catch (err) {
          var messageError = logError(section, err)
          responseObj.StatusCode = 3
          responseObj.Message = messageError


          context.response.write(JSON.stringify(responseObj))
        }
      }
      else if (context.request.method == 'POST') {
        var responseObj = {
          StatusCode: '',
          Message: '',
          Result: {}
        }

        log.audit({ title: 'Request Post', details: context.request })
        log.audit({ title: 'Response Post', details: context.response })
        log.audit({ title: 'context.request.body', details: context.request.body })

        try {

          section = 'Get Parameters'
          {
            var objContext = JSON.parse(context.request.body);
            log.audit({ title: 'objContext', details: JSON.stringify(objContext) });
            var custparam_mode = objContext.custparam_mode || '';
            var custparam_customer = objContext.custparam_customer || '';
            var custparam_subsidiary = objContext.custparam_subsidiary || '';
            var custparam_location = objContext.custparam_location || '';
            var custparam_memo = objContext.custparam_memo || '';
            var custparam_discauntglb = objContext.custparam_discauntglb || '';
            var custparam_items = objContext.custparam_items || '';
            var custparam_payment = objContext.custparam_payment || '';
            var custparam_invoice = objContext.custparam_invoice || '';
            var custparam_forma = objContext.custparam_forma || '';
            var custparam_metodo = objContext.custparam_metodo || '';
            var custparam_cfdi = objContext.custparam_cfdi || '';
            var custparam_createdby = objContext.custparam_createdby || '';
            var custparam_timbrar = objContext.custparam_timbrar == 'T';
            log.audit({ title: 'custparam_mode', details: custparam_mode });
            log.audit({ title: 'custparam_items', details: custparam_items });

            /* if (custparam_items) {
              custparam_items = JSON.parse(custparam_items);
            }
            if (custparam_payment) {
              custparam_payment = JSON.parse(custparam_payment);
            } */
          }

          section = 'Get Data - Mode: ' + custparam_mode
          {
            switch (custparam_mode) {
              case 'create':
                {
                  /*
                  &custparam_timbrar=true
                  &custparam_forma=1
                  &custparam_metodo=1
                  &custparam_cfdi=22
                  &custparam_createdby=2
                  &custparam_discauntglb=40
                  &custparam_mode=create
                  &custparam_customer=34&custparam_subsidiary=2&custparam_location=3&custparam_memo='Factura ejemplo'&custparam_items={"i1": {"id": "42","quantity": "2","tax_code": "5","priceLevel": "2","discount": {"d1i1": {"id": "40","tax_code": "5"}}},"i2": {"id": "42","quantity": "1","tax_code": "5","priceLevel": "1","discount": {"d1i2": {"id": "40","tax_code": "5"},"d2i2": {"id": "40","tax_code": "5"}}}}&custparam_payment={"6": {"id": "6","amount": "100"},"5": {"id": "5","amount": "500"}}
                 */
                  var objRetun = {
                    idInvoice: 0,
                    urlTiquet: '',
                    urlSatTimbrar: ''/* ,
                  urlSatXml: '',
                  uuid: '' */
                  };

                  objRetun.idInvoice = createData(custparam_customer, custparam_subsidiary, custparam_location, custparam_memo, custparam_discauntglb, custparam_items, custparam_forma, custparam_metodo, custparam_cfdi, custparam_createdby);
                  if (parseInt(objRetun.idInvoice) > 0) {
                    responseObj.StatusCode = 2
                    responseObj.Message = 'Factura creada Correctamente!'
                    {//Crear metodos pago
                      var addPayment = createPayment(objRetun.idInvoice, custparam_payment);
                      if (addPayment) {
                        responseObj.Message += ' Metodos de pago agregados Correctamente!';
                      } else {
                        responseObj.Message += 'Error Metodo de pago!'
                      }

                    }

                    {//crear URL de pdf y xml de sat
                      if (custparam_timbrar) {
                        var timbrarFactura = timbrarInvoice(objRetun.idInvoice);
                        if (timbrarFactura) {
                          objRetun.urlSatTimbrar = timbrarFactura;
                          responseObj.Message += ' Se obtuvo Link para timbrar!';
                          responseObj.StatusCode = 2;

                        } else {
                          responseObj.Message += ' Error con link para timbrar!';
                          responseObj.StatusCode = 3;
                        }
                        // var urlInvoice = getUrlInvoice(objRetun.idInvoice);
                        // objRetun.urlSatPdf = urlInvoice.pdf;
                        // objRetun.urlSatXml = urlInvoice.xml;
                        // objRetun.uuid = urlInvoice.uuid;

                      } else {//crear pdf cliente
                        objRetun.urlTiquet = createUrlCliente(objRetun.idInvoice);
                      }
                    }
                  }

                  log.audit({ title: 'objRetun', details: JSON.stringify(objRetun) });
                  responseObj.Result = objRetun;
                }
                break

              default:
                responseObj.StatusCode = 3
                responseObj.Message = 'El parametro Mode está vacio!'

                break

            }
          }

          section = 'Print Result'
          {
            context.response.write(JSON.stringify(responseObj))
          }

        } catch (err) {
          var messageError = logError(section, err)
          responseObj.StatusCode = 3
          responseObj.Message = messageError


          context.response.write(JSON.stringify(responseObj))
        }
      }

    } catch (onRequest) {
      log.audit({ title: 'onRequestErrorFunction', details: onRequest.message });
      log.audit({ title: 'onRequestErrorFunction', details: JSON.stringify(onRequest) });
    }
  }


  function getData() {

    var result = {}

    section = 'Get Payment Method';
    {

      var paymentSearch = search.create({
        type: search.Type.PAYMENT_METHOD,
        filters: [
          ['isinactive', search.Operator.IS, 'F']
        ],
        columns: [
          { name: 'name' }
        ]
      });

      var resultData = paymentSearch.run();
      var start = 0;
      do {
        var resultSet = resultData.getRange(start, start + 1000);
        if (resultSet && resultSet.length > 0) {
          for (var i = 0; i < resultSet.length; i++) {

            var id = resultSet[i].id;
            var name = resultSet[i].getValue({ name: 'name' }) || '';

            if (!result[id]) {
              result[id] = {
                name: name,
                id: id
              };
            }
          }
        }
        start += 1000;

      } while (resultSet && resultSet.length === 1000);

      log.audit({ title: 'paymentMethods', details: result });

    }

    return result

  }

  function informacionTimbrado() {
    var objReturn = {};
    try {

    } catch (funcrionError) {
      log.audit({ title: 'funcrionError', details: funcrionError.message });
      log.audit({ title: 'funcrionError', details: JSON.stringify(funcrionError) });
    }
    log.audit({ title: 'objReturn', details: JSON.stringify(objReturn) });
    return objReturn;
  }

  function getDefaultValuesCustomer(idCustomer) {
    var objReturn = {
      forma: {
        name: '',
        id: ''
      },
      metodo: {
        name: '',
        id: ''
      },
      uso: {
        name: '',
        id: ''
      }
    };
    try {

      var customerLookupField = search.lookupFields({
        type: record.Type.CUSTOMER,
        id: idCustomer,
        columns: ['custentity_efx_fe_metodopago', 'custentity_efx_fe_formapago', 'custentity_efx_fe_usocfdi']
      });
      log.audit({ title: 'Customer LookupField', details: JSON.stringify(customerLookupField) });

      objReturn.forma.id = customerLookupField.custentity_efx_fe_formapago[0].value;
      objReturn.forma.name = customerLookupField.custentity_efx_fe_formapago[0].text;
      objReturn.metodo.id = customerLookupField.custentity_efx_fe_metodopago[0].value;
      objReturn.metodo.name = customerLookupField.custentity_efx_fe_metodopago[0].text;
      objReturn.uso.id = customerLookupField.custentity_efx_fe_usocfdi[0].value;
      objReturn.uso.name = customerLookupField.custentity_efx_fe_usocfdi[0].text;

    } catch (funcrionError) {
      log.audit({ title: 'funcrionError', details: funcrionError.message });
      log.audit({ title: 'funcrionError', details: JSON.stringify(funcrionError) });
    }
    log.audit({ title: 'objReturn', details: JSON.stringify(objReturn) });
    return objReturn;
  }

  function getUsoCfdi() {//customrecord_efx_fe_usocfdi
    var objReturn = {};
    try {
      var result = search.create({
        type: 'customrecord_efx_fe_usocfdi',
        filters: [
          ['isinactive', search.Operator.IS, 'F'], 'and',
          ['custrecord_efx_fe_uso_code', search.Operator.ISNOTEMPTY, null]
        ],
        columns: [
          { name: 'name' },
          { name: 'custrecord_efx_fe_uso_code' },
        ]
      });

      var resultData = result.run();
      var start = 0;
      do {
        var resultSet = resultData.getRange(start, start + 1000);
        if (resultSet && resultSet.length > 0) {
          for (var i = 0; i < resultSet.length; i++) {

            var id = resultSet[i].id;
            var name = resultSet[i].getValue({ name: 'name' }) || '';
            var custrecord_efx_fe_uso_code = resultSet[i].getValue({ name: 'custrecord_efx_fe_uso_code' }) || '';

            if (!objReturn[id]) {
              objReturn[id] = {
                id: id,
                sat: custrecord_efx_fe_uso_code,
                name: name
              };
            }
          }
        }
        start += 1000;

      } while (resultSet && resultSet.length == 1000);

    } catch (funcrionError) {
      log.audit({ title: 'funcrionError', details: funcrionError.message });
      log.audit({ title: 'funcrionError', details: JSON.stringify(funcrionError) });
    }
    log.audit({ title: 'objReturn', details: JSON.stringify(objReturn) });
    return objReturn;
  }
  function getMEtodoPago() {//  customrecord_efx_fe_metodospago
    var objReturn = {};
    try {
      var result = search.create({
        type: 'customrecord_efx_fe_metodospago',
        filters: [
          ['isinactive', search.Operator.IS, 'F'], 'and',
          ['custrecord_efx_fe_mtdpago_codsat', search.Operator.ISNOTEMPTY, null]
        ],
        columns: [
          { name: 'name' },
          { name: 'custrecord_efx_fe_mtdpago_codsat' },
        ]
      });

      var resultData = result.run();
      var start = 0;
      do {
        var resultSet = resultData.getRange(start, start + 1000);
        if (resultSet && resultSet.length > 0) {
          for (var i = 0; i < resultSet.length; i++) {

            var id = resultSet[i].id;
            var name = resultSet[i].getValue({ name: 'name' }) || '';
            var custrecord_efx_fe_mtdpago_codsat = resultSet[i].getValue({ name: 'custrecord_efx_fe_mtdpago_codsat' }) || '';

            if (!objReturn[id]) {
              objReturn[id] = {
                id: id,
                sat: custrecord_efx_fe_mtdpago_codsat,
                name: name
              };
            }
          }
        }
        start += 1000;

      } while (resultSet && resultSet.length == 1000);
    } catch (funcrionError) {
      log.audit({ title: 'funcrionError', details: funcrionError.message });
      log.audit({ title: 'funcrionError', details: JSON.stringify(funcrionError) });
    }
    log.audit({ title: 'objReturn', details: JSON.stringify(objReturn) });
    return objReturn;
  }
  function getFormaPago() {//customrecord_efx_fe_formapago
    var objReturn = {};
    try {
      var result = search.create({
        type: 'customrecord_efx_fe_formapago',
        filters: [
          ['isinactive', search.Operator.IS, 'F'],
          'and',
          ['custrecord_efx_fe_fompago_codsat', search.Operator.ISNOTEMPTY, null]
        ],
        columns: [
          { name: 'name' },
          { name: 'custrecord_efx_fe_fompago_codsat' },
        ]
      });

      var resultData = result.run();
      var start = 0;
      do {
        var resultSet = resultData.getRange(start, start + 1000);
        if (resultSet && resultSet.length > 0) {
          for (var i = 0; i < resultSet.length; i++) {

            var id = resultSet[i].id;
            var name = resultSet[i].getValue({ name: 'name' }) || '';
            var custrecord_efx_fe_fompago_codsat = resultSet[i].getValue({ name: 'custrecord_efx_fe_fompago_codsat' }) || '';

            if (!objReturn[id]) {
              objReturn[id] = {
                id: id,
                sat: custrecord_efx_fe_fompago_codsat,
                name: name
              };
            }
          }
        }
        start += 1000;

      } while (resultSet && resultSet.length == 1000);
    } catch (funcrionError) {
      log.audit({ title: 'funcrionError', details: funcrionError.message });
      log.audit({ title: 'funcrionError', details: JSON.stringify(funcrionError) });
    }
    log.audit({ title: 'objReturn', details: JSON.stringify(objReturn) });
    return objReturn;
  }

  function getItemDiscount(paramSubsidiary) {
    var objReturn = {};
    try {
      var result = search.create({
        type: search.Type.DISCOUNT_ITEM,
        filters: [
          ['isinactive', search.Operator.IS, 'F'],
          'and',
          ['subsidiary', search.Operator.ANYOF, paramSubsidiary]
        ],
        columns: [
          { name: 'baseprice' },
          { name: 'displayname' }
        ]
      });

      var resultData = result.run();
      var start = 0;
      do {
        var resultSet = resultData.getRange(start, start + 1000);
        if (resultSet && resultSet.length > 0) {
          for (var i = 0; i < resultSet.length; i++) {
            var idSearch = resultSet[i].id;
            var name = resultSet[i].getValue({ name: 'displayname' });
            var basepriceName = resultSet[i].getValue({ name: 'baseprice' }) || 0;
            var baseprice = resultSet[i].getValue({ name: 'baseprice' }) || 0;
            baseprice = baseprice.replace(/-/g, '');
            baseprice = baseprice.replace(/%/g, '');
            var decimal = (parseFloat(baseprice) / 100) || 0;
            if (!objReturn[idSearch]) {
              objReturn[idSearch] = {
                id: idSearch,
                name: basepriceName,
                detalle: name,
                value: decimal
              };
            }
          }
        }
        start += 1000;
      } while (resultSet && resultSet.length == 1000);

    } catch (getItemDiscount) {
      log.audit({ title: 'getItemDiscount', details: getItemDiscount.message });
      log.audit({ title: 'getItemDiscount', details: JSON.stringify(getItemDiscount) });
    }
    log.audit({ title: 'objReturn', details: JSON.stringify(objReturn) });
    return objReturn;
  }

  function timbrarInvoice(paramIdInvoice) {
    log.audit({ title: 'timbrarInvoice Param', details: paramIdInvoice });
    var objRetun = '';
    try {
      var SLURL = url.resolveScript({
        scriptId: 'customscript_efx_fe_cfdi_sl',
        deploymentId: 'customdeploy_efx_fe_cfdi_sl',
        returnExternalUrl: false
      });
      log.audit({ title: 'SLURL ', details: SLURL });

      // var scheme = 'https://';
      // var host = url.resolveDomain({
      //   hostType: url.HostType.APPLICATION
      // });

      //Get URL
      var parametroSl = '';
      parametroSl += '&custparam_tranid=' + paramIdInvoice;
      parametroSl += '&custparam_trantype=invoice';
      // parametroSl += '&custparam_s=' + 'false';
      // parametroSl += '&custparam_ss=' + 'false';
      parametroSl += '&custparam_pa=' + 'T';
      parametroSl += '&custparam_response=' + 'T';
      parametroSl += '&rnd=' + Math.floor(Math.random() * 1000000);


      log.audit({ title: 'parametroSl ', details: parametroSl });

      objRetun = SLURL + parametroSl;


    } catch (timbrarInvoiceError) {
      log.audit({ title: 'timbrarInvoiceError', details: timbrarInvoiceError.message });
      log.audit({ title: 'timbrarInvoiceError', details: JSON.stringify(timbrarInvoiceError) });
    }
    log.audit({ title: 'objRetun', details: 'objRetun' });
    return objRetun;
  }

  function getUrlInvoice(paramIdInvoice) {
    var objRetun = {
      pdf: '',
      xml: '',
      uuid: ''
    }
    try {
      var invoiceLookupField = search.lookupFields({
        type: record.Type.INVOICE,
        id: paramIdInvoice,
        columns: ['type', 'custbody_efx_fe_pdf_file_ns', 'custbody_efx_fe_xml_file_ns', 'custbody_efx_fe_uuid']
      });
      log.audit({ title: 'Item LookupField', details: JSON.stringify(invoiceLookupField) });

      var scheme = 'https://';
      var host = url.resolveDomain({
        hostType: url.HostType.APPLICATION
      });

      objRetun.pdf = scheme + host + invoiceLookupField.custbody_efx_fe_pdf_file_ns;
      objRetun.xml = scheme + host + invoiceLookupField.custbody_efx_fe_xml_file_ns;
      objRetun.uuid = invoiceLookupField.custbody_efx_fe_uuid;


    } catch (getUrlInvoiceError) {
      log.audit({ title: 'getUrlInvoiceError', details: getUrlInvoiceError.message });
      log.audit({ title: 'getUrlInvoiceError', details: JSON.stringify(getUrlInvoiceError) });
    }
    log.audit({ title: 'objRetun', details: JSON.stringify(objRetun) });
    return objRetun;
  }


  //'Create Invoice';
  function createData(paramCustomer, paramSubsidiary, paramLocation, paramMemo, paramDiscountitem, paramItems, paramForma, paramMetodo, paramCfdi, paramCreatedb) {
    log.audit({ title: 'paramCustomer', details: paramCustomer });
    log.audit({ title: 'paramSubsidiary', details: paramSubsidiary });
    log.audit({ title: 'paramLocation', details: paramLocation });
    log.audit({ title: 'paramMemo', details: paramMemo });
    log.audit({ title: 'paramDiscountitem', details: paramDiscountitem });
    log.audit({ title: 'paramItems', details: paramItems });
    var recordId = '';
    try {
      var rec = record.create({
        type: record.Type.INVOICE,
        isDynamic: true,
        defaultValues: {
          entity: paramCustomer
        }
      });

      rec.setValue({
        fieldId: 'subsidiary',
        value: paramSubsidiary,
        ignoreFieldChange: true
      });

      rec.setValue({
        fieldId: 'location',
        value: paramLocation,
        ignoreFieldChange: true
      });

      rec.setValue({
        fieldId: 'custbody_efx_pos_origen',
        value: true,
        ignoreFieldChange: true
      });

      rec.setValue({
        fieldId: 'memo',
        value: paramMemo || '',
        ignoreFieldChange: true
      });

      rec.setValue({
        fieldId: 'approvalstatus',
        value: 2,
        ignoreFieldChange: true
      });

      // if (paramDiscountitem) {
      //   rec.setValue({
      //     fieldId: 'discountitem',
      //     value: paramDiscountitem,
      //     ignoreFieldChange: true
      //   });
      // }
      if (paramForma) {
        rec.setValue({
          fieldId: 'custbody_efx_fe_formapago',
          value: paramForma,
          ignoreFieldChange: true
        });
      }
      if (paramMetodo) {
        rec.setValue({
          fieldId: 'custbody_efx_fe_metodopago',
          value: paramMetodo,
          ignoreFieldChange: true
        });
      }
      if (paramCfdi) {
        rec.setValue({
          fieldId: 'custbody_efx_fe_usocfdi',
          value: paramCfdi,
          ignoreFieldChange: true
        });
      }
      if (paramCreatedb) {
        rec.setValue({
          fieldId: 'custbody_efx_pos_created_by',
          value: paramCreatedb,
          ignoreFieldChange: true
        });
      }

      for (var l in paramItems) {
        log.audit({ title: 'item invoice', details: 'json:  ' + JSON.stringify(paramItems[l]) });
        var lineNum = rec.selectNewLine({
          sublistId: 'item'
        });

        rec.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          value: paramItems[l].id,
          // ignoreFieldChange: true
        });

        rec.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'quantity',
          value: paramItems[l].quantity,
          //ignoreFieldChange: true
        });

        rec.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'taxcode',
          // line: l,
          value: paramItems[l].tax_code//impuesto
          //ignoreFieldChange: true
        });

        if (paramItems[l].priceLevel) {
          rec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'price',
            // line: l,
            value: paramItems[l].priceLevel,//pricelevel
            //ignoreFieldChange: true
          });
        }
        /* rec.setCurrentSublistValue({
          sublistId: 'item',
          fieldId: 'location',
          value: paramLocation,
          ignoreFieldChange: true
        }); */
        {
          /*


            rec.setCurrentSublistValue({
              sublistId: 'item',
              fieldId: 'rate',
              line: l,
              value: paramItems[l].baseprice,
              // ignoreFieldChange: true
            });
           */
        }

        rec.commitLine({
          sublistId: 'item'
        });


        // for (var idDiscount in paramItems[l].discounts) {
        if (paramItems[l].discounts.id) {

          var lineDiscount = rec.selectNewLine({
            sublistId: 'item'
          });

          rec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: paramItems[l].discounts.id
          });

          rec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'taxcode',
            // line: l,
            value: paramItems[l].discounts.tax_code,//impuesto
          });

          /*  rec.setCurrentSublistValue({
             sublistId: 'item',
             fieldId: 'location',
             value: paramLocation,
             ignoreFieldChange: true
           }); */

          rec.commitLine({
            sublistId: 'item'
          });

        }

      }

      recordId = rec.save({
        enableSourcing: true,
        ignoreMandatoryFields: true
      });
    } catch (createDataError) {
      log.audit({ title: 'createDataError', details: createDataError.message });
      log.audit({ title: 'createDataError', details: JSON.stringify(createDataError) });
    }

    log.audit({ title: 'Invoice Id: ' + l, details: recordId });
    return recordId;
  }

  function createPayment(idTransaction, payment_methods) {
    var boolReturn = true;
    try {
      for (var p in payment_methods) {
        var rec = record.transform({
          fromType: record.Type.INVOICE,
          fromId: idTransaction,
          toType: record.Type.CUSTOMER_PAYMENT
        });

        rec.setValue({
          fieldId: 'paymentmethod',
          value: payment_methods[p].id,
          ignoreFieldChange: true
        });

        var numLines = rec.getLineCount({
          sublistId: 'apply'
        });

        for (var l = 0; l < numLines; l++) {
          var apply = rec.getSublistValue({
            sublistId: 'apply',
            fieldId: 'apply',
            line: l
          });

          if (apply) {
            rec.setSublistValue({
              sublistId: 'apply',
              fieldId: 'amount',
              line: l,
              value: payment_methods[p].amount
            });
          }
        }
        var paymentId = rec.save({
          enableSourcing: true,
          ignoreMandatoryFields: true
        });
        log.audit({ title: 'paymentId: ' + l, details: paymentId });
      }
    } catch (createPaymentError) {
      log.audit({ title: 'createPaymentError', details: createPaymentError.message });
      boolReturn = false;
    }
    log.audit({ title: 'pyment Succefull', details: boolReturn });
    return boolReturn;
  }

  function createUrlCliente(paramIdInvoice) {
    var urlRetutn = '';
    try {
      var SLURL = url.resolveScript({
        scriptId: 'customscript_efx_pos_ticket',
        deploymentId: 'customdeploy_efx_pos_ticket',
        returnExternalUrl: true
      });

      var parametroTicket = '';
      parametroTicket = '&custparam_id=' + paramIdInvoice;
      log.audit({ title: 'parametroTicket', details: parametroTicket });

      SLURL += parametroTicket;

      var responseTkt = https.request({
        method: https.Method.GET,
        url: SLURL
      });

      log.audit({ title: 'Response Tkt Code', details: responseTkt.code });
      log.audit({ title: 'Response Tkt Body', details: responseTkt.body });

      var xmlTicket = responseTkt.body.substring((responseTkt.body.indexOf('{') + 1), responseTkt.body.lastIndexOf('}'));
      log.audit({ title: 'XML Tkt Body', details: xmlTicket });

      var self = runtime.getCurrentScript();

      var carpetaDefecto = self.getParameter({ name: 'custscript_efx_pos_vue_carpeta' }) || '';
      log.audit({ title: 'carpetaDefecto', details: carpetaDefecto });



      var tktBody = xmlTicket;
      var filePDF = render.xmlToPdf({
        xmlString: tktBody
      });
      filePDF.name = paramIdInvoice + '.pdf';
      filePDF.folder = carpetaDefecto;

      var fileId = filePDF.save();
      log.audit({ title: 'fileId', details: fileId });

      var fileObj = file.load({
        id: fileId
      });
      var scheme = 'https://';
      var host = url.resolveDomain({
        hostType: url.HostType.APPLICATION
      });

      urlRetutn = scheme + host + fileObj.url;

      // log.audit({ title: '', details:  });

    } catch (createUrlClienteError) {
      log.audit({ title: 'createUrlClienteError', details: createUrlClienteError.message });
      log.audit({ title: 'createUrlClienteError', details: JSON.stringify(createUrlClienteError) });
    }

    log.audit({ title: 'urlRetutn', details: urlRetutn });
    return urlRetutn;
  }


  function logError(section, err) {
    var err_Details = ''

    if (err instanceof nlobjError) {
      err_Details = err.getDetails()
    } else {
      err_Details = err.message
    }
    log.audit({ title: 'err', details: JSON.stringify(err) });
    log.error({
      title: 'Error Notification on ' + section,
      details: err_Details
    })
    return 'Error Notification on ' + section + ': ' + err_Details
  }

  return {
    onRequest: onRequest
  }
})
