// ********* FLuxit Mobile Framework ************** //
// ************ INICIALIZACION *************** //

// Inicializacion de mensajes y parametros generales
$(document).bind('mobileinit', function () {
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.pageLoadErrorMessage = "Error cargando actividad";
	$.mobile.loadingMessage = "Cargando ...";
	$.mobile.allowCrossDomainPages = true;
});

// Inicialización de geolocalización
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    //navigator.geolocation.getCurrentPosition(onSuccessLocalization, onErrorLocalization);
}

function onSuccessLocalization(position) {
    var element = document.getElementById('geolocation');
    element.innerHTML = 
      'Latitud: '           + position.coords.latitude       + '<br />' +
      'Longitud: '        + position.coords.longitude         + '\n' +
      'Altitud: '         + position.coords.altitude          + '\n' +
      'Precisión: '       + position.coords.accuracy          + '\n' +
      'Precisión altitud' + position.coords.altitudeAccuracy  + '\n' +
      'Dirección: '       + position.coords.heading           + '\n' +
      'Velocidad: '       + position.coords.speed             + '\n' +
      'Timestamp: '       + new Date(position.timestamp)      + '\n'
      ;
}

// La función 'callback' onError recibe un objeto `PositionError`.
//
function onErrorLocalization(error) {
	var element = document.getElementById('geolocation');
    element.innerHTML = 'código: '    + error.code    + '\n' +
          'mensaje: ' + error.message + '\n';
}

// escuchar boton atras, para volver correctamente
// FIX Android
document.addEventListener("backbutton", function(e){
    if($.mobile.activePage.is('#init')){
        e.preventDefault();
        navigator.app.exitApp();
    }
    else {
        navigator.app.backHistory()
    }
}, false);


//FIX para BlackBerry
if(isset('blackberry')){
	blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, function() {
		navigator.app.exitApp();
	});
}          

function isset(variable) {
	try {
		if (typeof(eval(variable_name)) != 'undefined')
			if (eval(variable_name) != null)
				return true;
	} catch(e) {}
    return false;
}

// ************* FIN INICIALIZACION ************ //
