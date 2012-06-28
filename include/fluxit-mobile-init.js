// ********* FLuxit Mobile Framework ************** //
// ************ INICIALIZACION *************** //

// Inicializacion de mensajes y parametros generales
$(document).bind('mobileinit', function () {
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.pageLoadErrorMessage = "Error cargando actividad";
	$.mobile.loadingMessage = "Cargando ...";
	$.mobile.allowCrossDomainPages = true;
	$.mobile.buttonMarkup.hoverDelay = 0;
});

// Inicialización de geolocalización
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    //navigator.geolocation.getCurrentPosition(onSuccessLocalization, onErrorLocalization);
	document.addEventListener("backbutton", backButtonHandle, false);

	// configurar theme
	configureTheme();
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
function backButtonHandle(e){
    e.preventDefault();
    console.log("Back Button Pressed!");
    if($.mobile.activePage.is('#init'))
        navigator.app.exitApp();
    else
        navigator.app.backHistory();
}


//FIX para BlackBerry
if(isset('blackberry')){
	blackberry.system.event.onHardwareKey(blackberry.system.event.KEY_BACK, function() {
		if($.mobile.activePage == $('#init'))
			navigator.app.exitApp();
		else
	        navigator.app.backHistory();	
		return false;		
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
