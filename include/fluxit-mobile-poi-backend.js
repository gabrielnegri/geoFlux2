
// ********** SERVIDOR PRINCIPAL JSON : BACKEND APLICACIÓN *********
//var URL_SERVER = 'http://192.168.0.121';
//var URL_SERVER = 'http://app1.intranet.fluxit.com.ar/geolocal';
var URL_SERVER = 'http://flotante.intranet.fluxit.com.ar/geolocal';
//var URL_SERVER = 'http://192.168.0.122:8080/geolocal';
//var URL_SERVER = 'http://applocal.intranet.fluxit.com.ar/geolocal'; 

//******* VARIABLES PROPIAS DE LA APLICACIÓN
var CURRENT_LOCATION = "-34.9169,-57.9570";
var CURRENT_DISTANCE = 0.1;
var lastPois; // ultima lista de POIs cargadas
var resultPois; // lista de pois resultantes de una búsqueda
var currentPoi; //POI que se esta visualizando
var lastLocationPoi; //Último market de ubicación 
var listInitialized = false;
var showCurrentPoiInMap = false; // Mostrar poi en el mapa desde la ventana de información
var THEME = 'a';

//****** CONFIGURACIÓN DE SERVICIOS BASE ****** 
var URL_SERVICE_SEARCH = URL_SERVER+'/pois/search.action'+'?location='+CURRENT_LOCATION;
var URL_SERVICE_SEARCH_BY_ID = URL_SERVER+'/pois/searchById.action?id=';
var URL_SERVICE_VALORACION= URL_SERVER+'/valoracion/send.action';

// favoritos guardados
var LS_FAVS = new Array();

// ********** FUNCIONES DE NEGOCIO *************** / 
// hace la invocación de busqueda y luego pinta la pantalla como listado
function callPoiList(){
	// TODO Como pregunto si ya complete la lista?
	if(listInitialized)
		$.mobile.hidePageLoadingMsg();
	else
		callSearchPoisBackend(renderPoiList);
}

//Pinta la pantalla de lista de POIS 
function renderPoiList(json){
	var point = CURRENT_LOCATION.split(',');
    var currentPoint = new google.maps.LatLng(point[0], point[1]);  
	$(json).each(function(i, poi) { 
		var li = $('<li />');
		li.attr('id', 'li'+poi.id);
		
		var a = $('<a />');
		if(poi.favorite == true)
			a.addClass('fav');
		
		var img = $('<img />').attr('src', this.imageUrl).attr('alt', 'icon');
		var h3 = $('<h3 />').text(this.nombre);
		
		var poiPoint = new google.maps.LatLng(poi.x, poi.y);
		
		var miledistance = currentPoint.distanceFrom(poiPoint, 3959).toFixed(1);  
		var kmdistance = (miledistance * 1.609344).toFixed(1);  
		var isFav = '';
		var p = $('<p />').text(this.categoria + ' - a ' + kmdistance + ' kms. ');
		
		//var distance= $('<p />').text('Distancia '+kmdistance + ' Kms.');
		
		
		
		a.attr('href', '#poi?id='+this.id);
		a.append(img).append(h3).append(p);
		li.append(a);
		$('#poilist').append(li);
	});
	
	$('#poilist').listview("refresh");
	listInitialized = true;
	$.mobile.hidePageLoadingMsg();
}

//Llena de información la pantalla de vista de un POI
function fillPoiInformation(id){
	poi = findPoiById(id);
	currentPoi = poi;

	$('#poi-title').text(poi.nombre);
	$('#poi-nombre').text(poi.nombre);
	$('#poi-categoria').text(poi.categoria);
	$('#poi-descripcion').text(poi.descripcion);
	$('#poi-tel').text(poi.telefono);
	$('#poi-tel').attr('href', 'tel:' + poi.telefono)
	$('#poi-direccion').text(poi.direccion);
	$('#poi-web').attr('href', poi.pageUrl).text(poi.pageUrl);
	$('#buttonFav').attr('checked', poi.favorite ? true : false);

	$('#caracteristicas').text('');
	$(poi.caracteristicas).each(function(i, c) {
		var caract = $('<div />').append(
			$('<span />').addClass('underline').text(c.nombre).after(
				$('<span />').text(': ' + c.valor)));
		$('#caracteristicas').append(caract);
		
	});
	pintarValoraciones(poi);
	src = poi.imageUrl;
	
	$('#poi-image').attr('src', src)
	
	$.mobile.hidePageLoadingMsg();
	
}

//Pinta las valoraciones de un POI
function pintarValoraciones(poi){
	$('#valoraciones').text('');
	$('#formValoracion').text('');
	
	$(poi.valoracion).each(function(i, v) {
		
		var field = $('<div />');
		var label = $('<label />').attr('for', v.nombre).text(v.descripcion + ':').addClass('underline').css('margin-bottom', '10px');
		var select = $('<select/>').attr('name', v.nombre).attr('id', v.name).attr('data-mini','true').attr('class','valoracionCombo');
		select.append($('<option />').val(0).html('No valorar'));
		select.append($('<option />').val(1).html('Malo'));
		select.append($('<option />').val(2).html('Regular'));
		select.append($('<option />').val(3).html('Bueno'));
		field.append(label);
		field.append(select);
		val = $('<span />').text(v.descripcion).addClass('underline');
		votos  = $('<span />').text(': ' + v.valor + '(Cant: '+v.cantidadVotos+')');
		
		
		$('#valoraciones').append($('<div />').append(val).append(votos));
		$('#formValoracion').append(field);
		
	});	
	$('#formValoracion').trigger('create');
}

// Busca un POI por el ID, si hay lista lo saca de ahi y sino va al servicio
function findPoiById(id){
	if (lastPois == null){
		// Si la lista no está cargada lo busco por ID
		$.ajax({
				url: URL_SERVICE_SEARCH_BY_ID+id,
				async:   false,
				success: function(poi) {
					currentPoi = poi;
				},
				error: function(d,msg) {
					alert(msg);
				}
			});		
		return currentPoi;
		
	}else {
		// Viene de la lista, lo recupero de ahi y no hago el call
		var result = null; 
		$(lastPois).each(function(i, poi) {
			//alert(this.id);
			if (poi.id == id){
				
				result = poi;
			}
		});
		return result;
	}
}

//Carga la lista de POIs y pinta el MAPA
function loadMap(){
	callSearchPoisBackend(renderPoisMap);
}


// Esta función llama al backend para buscar los pois y con el resultado llama al callback
// Sirve para realizar cualquier tarea como pintar la lista o pintar el mapa
function callSearchPoisBackend(callbakfunction){
	readFavorites();
	$.ajax({
		url: URL_SERVICE_SEARCH+'&distance='+CURRENT_DISTANCE,
		success: function(json) {
			lastPois = json;
			$(lastPois).each(function(i, poi){
				if(LS_FAVS.indexOf(poi.id) != -1)
					poi.favorite = true;
				else
					poi.favorite = false;
			});
			callbakfunction(json);
		    $.mobile.hidePageLoadingMsg();
		},
		error: function(d,msg) {
			alert(msg);
		}
	});
}

// Renderiza la pantalla de MAPA ubicando los pois dentro del mapa de google
function renderPoisMap(json){
	var markers = [];
	$(json).each(function(i, poi) {
		
		var icon ='img/poi.png';
		if(poi.favorite)
			icon = 'img/fav.png';
		
		$('#map_canvas').
				gmap('addMarker', { position: new google.maps.LatLng(poi.x, poi.y), 'poiid': poi.id, 'icon': icon })
				.click(function() {
					$.mobile.changePage('#poi?id='+poi.id);
				});
		
	});

	if(showCurrentPoiInMap){
		var point = new google.maps.LatLng(currentPoi.x, currentPoi.y);
		$('#map_canvas').gmap('get','map').setOptions({'center':point, 'zoom': 17});
		showCurrentPoiInMap = false;
	}	
	$('#map_canvas').gmap('refresh');
	
	$.mobile.hidePageLoadingMsg();
}

function readFavorites(){
	var favs = window.localStorage.getItem('favoritos');
	if(favs == null)
		return;
	LS_FAVS = favs.split(',');
}

function addToFavoritos(poi){
	var favs = window.localStorage.getItem('favoritos');
	if(favs == null)
		window.localStorage.setItem('favoritos', poi.id);
	else
		window.localStorage.setItem('favoritos', favs + ',' + poi.id);
	LS_FAVS = window.localStorage.getItem('favoritos').split(',');
	poi.favorite = true;
	// actualizar lista y mapa
	changeMapFav(poi);
}

function removeFromFavoritos(poi){
	var favs = window.localStorage.getItem('favoritos');
	LS_FAVS = favs.split(',');
	if(LS_FAVS.indexOf(poi.id) >= 0)
		LS_FAVS.splice(LS_FAVS.indexOf(id),1);
	window.localStorage.setItem('favoritos', LS_FAVS.join());
	poi.favorite = false;
	// actualizar lista y mapa
	changeMapFav(poi);
}

function changeMapFav(poi){
	if(poi.favorite)
		$('#li' + poi.id + ' a').addClass('fav');
	else
		$('#li' + poi.id + ' a').removeClass('fav');
	text('(**)');
	$('#map_canvas').gmap('find', 'markers', { 'property': 'poiid', 'value': poi.id }, function(marker, isFound) {
        if (isFound) {
        	if(poi.favorite)
        		marker.setIcon('img/fav.png');
        	else
        		marker.setIcon('img/poi.png');
        }
	});
	$('#map_canvas').gmap('refresh');
}

//Saca los valores del form y envía la valoracion al server, actualiza la pantalla
function enviarValoracion(){
		valores = {};
		valores['id']=currentPoi.id;
		$(".valoracionCombo").each(
			function(i,e){
					valores[$(e).attr('name')] =$(e).val();
				}
			);
		 $.ajax({
			'url' : URL_SERVICE_VALORACION,
			'data' :valores,
			'dataType': 'json',
			'contentType': "application/json; charset=utf-8",
			'success': procesarRespuestaValoracion
			}
		);
}

//Procesa la respuesta de la valoracion para ver que hace
function procesarRespuestaValoracion(poi){
	pintarValoraciones(poi);
	navigator.notification.alert('Gracias por su participación!', null, 'Valoración enviada');
}

// Mostrar ubicación actual en el mapa
// TODO refactorizar
function showMyLocation(){
	navigator.geolocation.getCurrentPosition(function(position){
		if(lastLocationPoi != null)
			lastLocationPoi.setMap(null);
		var point = position.coords.latitude + ',' + position.coords.longitude;
		lastLocationPoi = $('#map_canvas').gmap('addMarker', {
			id: 'my_location',
			position: point,
			icon: 'img/position.png'
		});
		$('#map_canvas').gmap('get','map').setOptions({'center':point, 'zoom': 17});
	}, function(){
		// TODO mostrar error.
		alert('error obteniendo ubicación')
	});
}

function showPOIInMap(){
	if(currentPoi != null){
		$.mobile.changePage('#map?point=' + currentPoi.x + ',' + currentPoi.y);
	}
}


function testCalcularDistancia(){
	
	var point = CURRENT_LOCATION.split(',');
	
	$('#point1X').text(point[0]);
	$('#point1Y').text(point[1]);
	
	point2S = "-34.9199,-57.9599"
	var point2 = point2S.split(',');
	$('#point2X').text(point2[0]);
	$('#point2Y').text(point2[1]);
	
	lat1 = point[0];
	lon1 = point[1];
	lat2 = point2[0];
	lon2 = point2[1];

	
    var glatlng1 = new google.maps.LatLng(lat1, lon1);  
    var glatlng2 = new google.maps.LatLng(lat2, lon2);  
    var miledistance = glatlng1.distanceFrom(glatlng2, 3959).toFixed(1);  
    var kmdistance = (miledistance * 1.609344).toFixed(1);  
	
	$('#distance').text(kmdistance);
}

// Extensión del plugin de google para calcular la distancia entre dos puntos
google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
	// setup our variables
	var lat1 = this.lat();
	var radianLat1 = lat1 * (Math.PI / 180);
	var lng1 = this.lng();
	var radianLng1 = lng1 * (Math.PI / 180);
	var lat2 = newLatLng.lat();
	var radianLat2 = lat2 * (Math.PI / 180);
	var lng2 = newLatLng.lng();
	var radianLng2 = lng2 * (Math.PI / 180);
	// sort out the radius, MILES or KM?
	var earth_radius = 3959; // (km = 6378.1) OR (miles = 3959) - radius of
								// the earth

	// sort our the differences
	var diffLat = (radianLat1 - radianLat2);
	var diffLng = (radianLng1 - radianLng2);
	// put on a wave (hey the earth is round after all)
	var sinLat = Math.sin(diffLat / 2);
	var sinLng = Math.sin(diffLng / 2);

	// maths - borrowed from
	// http://www.opensourceconnections.com/wp-content/uploads/2009/02/clientsidehaversinecalculation.html
	var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2)
			* Math.pow(sinLng, 2.0);

	// work out the distance
	var distance = earth_radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));

	// return the distance
	return distance;
}

// Autentica el nombre de ueuario y lo guarda
function registrarUsuario(){
userName = $('#userName').val();
if (userName != null && userName != ''){
	navigator.notification.alert(
		'Usuario registrado',  // message
		dummy,              // callback to invoke with index of button pressed
		'Registro',            // title
		'Listo'          // buttonLabels
	    );


	console.log('Registrando usuario  '+userName);
	window.localStorage.setItem("GEOFLUX_USER", userName);
	$.mobile.changePage('#init');
}else {
	console.log('debe completa el usuario');
	}
}

//Obtiene el nombre de usuario guardado en el storage local
function obtenerUserNameRegistrado(){
var user = window.localStorage.getItem("GEOFLUX_USER");
//console.log('user '+user);
if (user == null){
	return 'no registrado';
}else {
	return user;
	}

}

// Guardar la configuración
function saveConfig(){
	window.localStorage.setItem("theme", $('#config_theme').val());
	navigator.notification.alert('Configuración guardada. Reinicie la aplicación para aplicar los cambios.', null, 'Configuración');
}

// Buscar POIs
function findPois(text, category){
 	$.mobile.showPageLoadingMsg();
	text = text.toLowerCase();
	resultPois = new Array();
	if(lastPois == null)
		callSearchPoisBackend(function(json){
			makeAndShowResult(text);
		});
	else {
		makeAndShowResult(text);
	}
}

function makeAndShowResult(text){
	var index = 0;
	$(lastPois).each(function(i, poi){
		if(poi.nombre.toLowerCase().indexOf(text) != -1
				|| poi.descripcion.toLowerCase().indexOf(text) != -1){
			resultPois[index] = poi;
			index++;
		}
	});
	$.mobile.changePage('#result');
}

// TODO Reutilizar el otro load!
function loadListResult(){  
	$('#poilistresult').empty();
	
	var point = CURRENT_LOCATION.split(',');
    var currentPoint = new google.maps.LatLng(point[0], point[1]);  
	$(resultPois).each(function(i, poi) { 
		var li = $('<li />');
		li.attr('id', 'li'+poi.id);
		
		var a = $('<a />');
		if(poi.favorite == true)
			a.addClass('fav');
		
		var img = $('<img />').attr('src', this.imageUrl).attr('alt', 'icon');
		var h3 = $('<h3 />').text(this.nombre);
		
		var poiPoint = new google.maps.LatLng(poi.x, poi.y);
		
		var miledistance = currentPoint.distanceFrom(poiPoint, 3959).toFixed(1);  
		var kmdistance = (miledistance * 1.609344).toFixed(1);  
		var isFav = '';
		var p = $('<p />').text(this.categoria + ' - a ' + kmdistance + ' kms. ');	
		
		a.attr('href', '#poi?id='+this.id);
		a.append(img).append(h3).append(p);
		li.append(a);
		$('#poilistresult').append(li);
	});
	
	$('#poilistresult').listview("refresh");
	$.mobile.hidePageLoadingMsg();
}

function dummy(p){}

// configurar theme
function configureTheme(){
	THEME = window.localStorage.getItem("theme");
	$.mobile.page.prototype.options.theme = THEME;
}