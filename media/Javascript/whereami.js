/*      PROTOTIPO OGGETTO
 var VideoRicevuti= {

 	"8FPHF8VV+F6": {
		 
 		"what": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..],
 		"how": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..],
 		"why": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..]
 	}
 }
 */

/**************SETTAGGIO MAPPA*************/

var posizioneattuale; //posizione iniziale
var posizioneiniziale;
var VideoRicevuti = {};







function initCoords() { //geolocalizza l'utente o apre la mappa a Bologna in assenza della posizione
	navigator.geolocation.getCurrentPosition(initAutocomplete, function (error) { //chiama initAutocodramplete con la tua posizione, senza consenso alla posizione ti porta a bologna
		if (error.code == error.PERMISSION_DENIED) {
			var position = {
				coords: {
					latitude: 44.4936714, //posizione di Bologna
					longitude: 11.3430347
				}
			};
			initAutocomplete(position);
		}
	});


}


var directionsRenderer;


function initAutocomplete(position) { // crea mappa e marker con tutte le loro funzionalità

	var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	posizioneattuale = coords;
	posizioneiniziale = coords;
	directionsRenderer = new google.maps.DirectionsRenderer; //servizi di google per la creazione di strade
	var directionsService = new google.maps.DirectionsService; //servizi di google per la creazione di strade
	var geocoder = new google.maps.Geocoder(); //servizio di google che converte luoghi in coordinate

	//crea l'oggetto mappa
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: coords,
	});
aggiornaVideo();

	//marker della tua posizione
	var marker = creaMarker(coords);
	marker.setMap(map);


	function geocodeAddress(geocoder, resultsMap, address) { //trasforma un indirizzo in un dato LatLng
		marker.setMap(null);
		geocoder.geocode({
			'address': address
		}, function (results) {
			resultsMap.setCenter(results[0].geometry.location);
			marker.setPosition(results[0].geometry.location)
			posizioneattuale = results[0].geometry.location;
			posizioneiniziale = results[0].geometry.location;
			aggiornaVideo();

		});
		showBar(false);
		return (marker)
	}

	directionsRenderer.setMap(map);
	//directionsRenderer.setPanel(document.getElementById('right-panel'));


	compiler(end, map);
	compiler(pos, map);


	document.getElementById('end').addEventListener('change', function () { //crea il percorso dalla tua posizione a quella desiderata
		directionsRenderer.set('directions', null);
		var arrivo = document.getElementById('end').value;
		
		calculateAndDisplayRoute(directionsService, directionsRenderer, posizioneattuale, arrivo);
		document.getElementById("end").value = "";
	});

	document.getElementById('pos').addEventListener('change', function () { //cambia il tuo luogo di partrenza
		var address = document.getElementById('pos').value;
		directionsRenderer.set('directions', null);
		marker = geocodeAddress(geocoder, map, address);
		marker.setMap(map);
		map.setZoom(15)
	});



	google.maps.event.addListener(marker, 'dragend', function () { //setta la tua posizione dopo che hai spostato il marker
		directionsRenderer.set('directions', null);
		marker.setPosition(marker.getPosition());
		posizioneattuale = marker.getPosition();
		posizioneiniziale = marker.getPosition();
		aggiornaVideo();
		
	});

}

function compiler(input, map) { // funzione che autocompila i textbox in base alla visualizzazione della mappa 

	var searchBox = new google.maps.places.SearchBox(input);
	map.controls.push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function () {
		searchBox.setBounds(map.getBounds());
	});

	searchBox.addListener('places_changed', function () {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

	})
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, partenza, arrivo) { //cerca e crea il percorso per arrivare ad un posto

	directionsService.route({

		origin: partenza,
		destination: arrivo,
		travelMode: 'WALKING',


	}, function (response, status) {
		if (status === 'OK') {

			directionsRenderer.setDirections(response);
			directionsRenderer.setOptions({
				suppressMarkers: true
			});
		} else {
			alert("No route found");
		}
	});

}



var flag;
function popolaVideoRicevuti(item) {
	flag = null;
	var descrizione = item.snippet.description.split(":");
	var olc = descrizione[0].split("-");
	if (olc[2]) { //controlla che ci siano tutte 3 componenti dell'OLC
		if (VideoRicevuti != {}) {
			for (var i in VideoRicevuti) {
				if (i == olc[2]) {
					flag = i;
				}
			}
			if (flag != null) {
				insertHere(flag, item, descrizione);
			} else {
				creaNuovo(olc[2], item, descrizione);
			}
		} else {
			creaNuovo(olc[2], item, descrizione);
		}

	}

}


function creaNuovo(olc, item, descrizione) {
	VideoRicevuti[olc] = new Object;
	VideoRicevuti[olc].what = new Array;
	VideoRicevuti[olc].how = new Array;
	VideoRicevuti[olc].why = new Array;

	var temp = new Object;
	temp.id = item.id.videoId;
	temp.titolo = item.snippet.title;
	temp.lingua = descrizione[2];
	temp.categoria = descrizione[3];
	temp.audience = descrizione[4];
	temp.dettagli = descrizione[5];


	if (descrizione[1] == "what") {
		VideoRicevuti[olc].what.push(temp);
	} else if (descrizione[1] == "how") {
		VideoRicevuti[olc].how.push(temp);
	} else if (descrizione[1] == "why") {
		VideoRicevuti[olc].why.push(temp);
	}

}
var oggProvvisorio;

function insertHere(flag, item, descrizione) {
	var temp = new Object;
	temp.id = item.id.videoId;
	temp.titolo = item.snippet.title;
	temp.lingua = descrizione[2];
	temp.categoria = descrizione[3];
	temp.audience = descrizione[4];
	temp.dettagli = descrizione[5];

	if (descrizione[1] == "what") {
		VideoRicevuti[flag].what.push(temp);
	} else if (descrizione[1] == "how") {
		VideoRicevuti[flag].how.push(temp);
	} else if (descrizione[1] == "why") {
		VideoRicevuti[flag].why.push(temp);
	}


}





//input: OLC da cercare
function TrovaVideo(OLC) {
	VideoRicevuti = {};
	gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(function () {
			try {
				var request = gapi.client.youtube.search.list({
					q: OLC,
					part: 'snippet',
					maxResults: 50
				});

				request.execute(function (response) {

					 //just for debug purpose
					response.items.forEach(function (item) {

						popolaVideoRicevuti(item);


					})
					
					PopolaMappa(VideoRicevuti);
					oggProvvisorio = JSON.parse(JSON.stringify(VideoRicevuti));
				});


			} catch (e) {
				console.log(e);
			}
		})



}


var map;
var arraymarker= new Array();

function PopolaMappa(oggettoOLC) {
	
	for(var i=0;i<arraymarker.length;i++){
		arraymarker[i].setMap(null);

	}
		
		
	arraymarker=[];

	
	for (let olc in oggettoOLC) {

		var posizioneOLC = new google.maps.LatLng(OpenLocationCode.decode(olc).latitudeCenter, OpenLocationCode.decode(olc).longitudeCenter)
		var mark=creaMarkerLuogo(posizioneOLC);
		arraymarker.push(mark);
		stampaMarker(mark, map);

	}

}

function stampaMarker(marker, map) {
	marker.setMap(map);
}

function creaMarker(coords) { //crea marker della tua posizione
	var marker = new google.maps.Marker({
		position: coords,
		draggable: true,
		animation: google.maps.Animation.DROP,
		id: "marker",
		icon: {
			url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
		}
	});
	return marker;
}


var markercliccato;

function creaMarkerLuogo(coords) { //crea marker del luogo in input
	var marker = new google.maps.Marker({
		position: coords,
		draggable: false,
		animation: google.maps.Animation.DROP,
		id: "mark",
		icon: {
			url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
		}
	});

	google.maps.event.addListener(marker, 'click', function () { // al click apre il player con i video di quel posto
		//apri div video
		//popola div con video del luogo cliccato

		var olc = OpenLocationCode.encode(marker.getPosition().lat(), marker.getPosition().lng());

		for (let tmp in VideoRicevuti) {

			if (olc == tmp) {
				videoPos = VideoRicevuti[tmp];
				arraywhy=videoPos.why;
				posizioneattuale=marker.getPosition();
				
				arrivo=olc;
				popolaDivVideo(videoPos);
				popolaWhat(videoPos);
			}
		}

	});

	google.maps.event.addListener(marker, 'mouseover', function () { //mostra un popup con il nome del posto

		var olc = OpenLocationCode.encode(marker.getPosition().lat(), marker.getPosition().lng());

		for (let tmp in VideoRicevuti) {

			if (olc == tmp) {
				var titolo;
				if(VideoRicevuti[tmp].what.length!=0){
					if(VideoRicevuti[tmp].what[0].titolo.split(":").length>1){
						titolo=VideoRicevuti[tmp].what[0].titolo.split(":")[0];
					}
					else if(VideoRicevuti[tmp].what[0].titolo.split("#").length>1){
						titolo=VideoRicevuti[tmp].what[0].titolo.split("#")[0];
						
					}else{
						if(VideoRicevuti[tmp].what[0].titolo.includes("what")){
							var tit=VideoRicevuti[tmp].what[0].titolo;
							titolo=tit.replace('what','');  // tolgo what dal titolo
						}
						else if(VideoRicevuti[tmp].what[0].titolo.includes("What")){
							var tit=VideoRicevuti[tmp].what[0].titolo;
							titolo=tit.replace('What','');  // tolgo what dal titolo
						}else{
							titolo=VideoRicevuti[tmp].what[0].titolo;
						}
						
					}
					
					var infowindow = new google.maps.InfoWindow({
						content: titolo
					  });
					infowindow.open(map, marker);
				}
				else if(VideoRicevuti[tmp].how.length!=0){

					if(VideoRicevuti[tmp].how[0].titolo.split(":").length>1){
						titolo=VideoRicevuti[tmp].how[0].titolo.split(":")[0];
					}
					else if(VideoRicevuti[tmp].how[0].titolo.split("#").length>1){
						titolo=VideoRicevuti[tmp].how[0].titolo.split("#")[0];
					}else{
						if(VideoRicevuti[tmp].how[0].titolo.includes("how")){
							var tit=VideoRicevuti[tmp].how[0].titolo;
							titolo=tit.replace('how','');  // tolgo what dal titolo
						}
						else if(VideoRicevuti[tmp].how[0].titolo.includes("How")){
							var tit=VideoRicevuti[tmp].how[0].titolo;
							titolo=tit.replace('How','');  // tolgo what dal titolo
						}else{
							titolo=VideoRicevuti[tmp].how[0].titolo;
						}
					}
					var infowindow = new google.maps.InfoWindow({
						content: titolo
					  });
					  infowindow.open(map, marker);
				}
				else if(VideoRicevuti[tmp].why.length!=0){
					if(VideoRicevuti[tmp].why[0].titolo.split(":").length>1){
						titolo=VideoRicevuti[tmp].why[0].titolo.split(":")[0];
					}
					else if(VideoRicevuti[tmp].why[0].titolo.split("#").length>1){
						titolo=VideoRicevuti[tmp].why[0].titolo.split("#")[0];
					}else{
						if(VideoRicevuti[tmp].why[0].titolo.includes("why")){
							var tit=VideoRicevuti[tmp].why[0].titolo;
							titolo=tit.replace('why','');  // tolgo what dal titolo
						}
						else if(VideoRicevuti[tmp].why[0].titolo.includes("Why")){
							var tit=VideoRicevuti[tmp].why[0].titolo;
							titolo=tit.replace('Why','');  // tolgo what dal titolo
						}else{
							titolo=VideoRicevuti[tmp].why[0].titolo;
						}
					}
					var infowindow = new google.maps.InfoWindow({
						content: titolo
					  });
					  infowindow.open(map, marker);
				}
				
			}
		}
		google.maps.event.addListener(marker, 'mouseout', function () { //chiudo il popup
			infowindow.close(map, this);
		});

	});

	return marker;
}







function aggiornaVideo(){
//trova video intorno a te e aggiunge i marker alla mappa
var lat=posizioneiniziale.lat();
var long=posizioneiniziale.lng();
var mioOlc = OpenLocationCode.encode(lat, long);
var olcGrande = mioOlc.substring(0, 6) + "00+-";
TrovaVideo(olcGrande);

}






//crea una lista di video
function popolaDivVideo(obj) {
	document.getElementById("bacicci").style.display = "block";
	$("#listavideo").html(''); //elimino contenuto lista


	for (let video in obj.what) {
		//controlli su dettagli
		
		if (obj.what[video].dettagli==undefined){
			obj.what[video].dettagli="none";
		}
		if(obj.what[video].dettagli.charAt(1)=="#"){
			obj.what[video].dettagli=obj.what[video].dettagli.charAt(0);
		}
		if (obj.what[video].dettagli.charAt(0)=="P"||obj.what[video].dettagli.charAt(0)=="p"){
			if(obj.what[video].dettagli.charAt(1)=="+"){
				if([1,2,3,4,5].indexOf(obj.what[video].dettagli.charAt(2)) == -1){
					obj.what[video].dettagli="none";
				}else{
					obj.what[video].dettagli=obj.what[video].dettagli.substring(2,3);
				}
				
			}
			else if(obj.what[video].dettagli.charAt(1)=="d"||obj.what[video].dettagli.charAt(1)=="g"){
				obj.what[video].dettagli="none";
			}else{
				obj.what[video].dettagli=obj.what[video].dettagli.substring(1,2);
			}
		}
		else if(obj.what[video].dettagli.charAt(0)=="d"||obj.what[video].dettagli.charAt(0)=="g"){
			obj.what[video].dettagli="none";
		}
		//controlli su audience
		if (obj.what[video].audience==undefined){
			obj.what[video].audience="none";
		}
		if (obj.what[video].audience.charAt(0)=="A"||obj.what[video].audience.charAt(0)=="a"){
			if(obj.what[video].audience.charAt(1)=="+"){
				
				
					obj.what[video].audience=obj.what[video].audience.substring(2,5);
				
			}
			else if(obj.what[video].audience.charAt(1)=="d"||obj.what[video].dettagli.charAt(0)=="g"){
				obj.what[video].audience="gen";
			}else{
				obj.what[video].audience=obj.what[video].audience.substring(1,4);
			}
			
		}
		else if(obj.what[video].audience.charAt(0)=="d"||obj.what[video].audience.charAt(0)=="g"){
			obj.what[video].audience="gen";
		}
	

		outputTitolo = '<li>' + '<img class="video-image" onclick="playThisVideo(\''+obj.what[video].id+'\')" width="50%" height="50%" src="https://img.youtube.com/vi/' + 
		obj.what[video].id +'/hqdefault.jpg" alt="YouTube Video"/>' + '<div  style=" width=50%; float: right;"><p><b>'+obj.what[video].titolo+'</b><br>purpose: what<br>lingua: '+
		obj.what[video].lingua+'<br>categoria: '+obj.what[video].categoria+'<br>audience: '+obj.what[video].audience+'<br>dettagli: '+obj.what[video].dettagli+'</p></div></li>';
		$("#listavideo").append(outputTitolo);
	}
	for (let video in obj.how) {

		
		if (obj.how[video].dettagli==undefined){
			obj.how[video].dettagli="none";
		}
		if(obj.how[video].dettagli.charAt(1)=="#"){
			obj.how[video].dettagli=obj.how[video].dettagli.charAt(0);
		}
		 if (obj.how[video].dettagli.charAt(0)=="P"||obj.how[video].dettagli.charAt(0)=="p"){
			if(obj.how[video].dettagli.charAt(1)=="+"){
				if([1,2,3,4,5].indexOf(obj.how[video].dettagli.charAt(2)) == -1){
					obj.how[video].dettagli="none";
				}else{
					obj.how[video].dettagli=obj.how[video].dettagli.substring(2,3);
				}
				
			}
			else if(obj.how[video].dettagli.charAt(1)=="d"||obj.how[video].dettagli.charAt(1)=="g"){
				obj.how[video].dettagli="none";
			}else{
				obj.how[video].dettagli=obj.how[video].dettagli.substring(1,2);
			}
		}
		else if(obj.how[video].dettagli.charAt(0)=="d"||obj.how[video].dettagli.charAt(0)=="g"){
			obj.how[video].dettagli="none";
		}
		//controlli su audience
		if (obj.how[video].audience==undefined){
			obj.how[video].audience="none";
		}
		if (obj.how[video].audience.charAt(0)=="A"||obj.how[video].audience.charAt(0)=="a"){
			if(obj.how[video].audience.charAt(1)=="+"){
				
				
					obj.how[video].audience=obj.how[video].audience.substring(2,5);
				
			}
			else if(obj.how[video].audience.charAt(1)=="d"||obj.how[video].dettagli.charAt(0)=="g"){
				obj.how[video].audience="gen";
			}else{
				obj.how[video].audience=obj.how[video].audience.substring(1,4);
			}
			
		}
		else if(obj.how[video].audience.charAt(0)=="d"||obj.how[video].audience.charAt(0)=="g"){
			obj.how[video].audience="gen";
		}
	

		outputTitolo = '<li>' + '<img class="video-image" onclick="playThisVideo(\''+obj.how[video].id+'\')" width="50%" height="50%" src="https://img.youtube.com/vi/' + 
		obj.how[video].id +'/hqdefault.jpg" alt="YouTube Video"/>' + '<div  style=" width=50%; float: right;"><p><b>'+obj.how[video].titolo+'</b><br>purpose: how<br>lingua: ' +
		obj.how[video].lingua+'<br>categoria: '+obj.how[video].categoria+'<br>audience: '+obj.how[video].audience+'<br>dettagli: '+obj.how[video].dettagli+'</p></div></li>';
		$("#listavideo").append(outputTitolo);
	}
	for (let video in obj.why) {
		//controlli dettagli
		if (obj.why[video].dettagli==undefined){
			obj.why[video].dettagli="none";
		}
		if(obj.why[video].dettagli.charAt(1)=="#"){
			obj.why[video].dettagli=obj.why[video].dettagli.charAt(0);
		}
		 if (obj.why[video].dettagli.charAt(0)=="P"||obj.why[video].dettagli.charAt(0)=="p"){
			if(obj.why[video].dettagli.charAt(1)=="+"){
				if([1,2,3,4,5].indexOf(obj.why[video].dettagli.charAt(2)) == -1){
					obj.why[video].dettagli="none";
				}else{
					obj.why[video].dettagli=obj.why[video].dettagli.substring(2,3);
				}
				
			}
			else if(obj.why[video].dettagli.charAt(1)=="d"||obj.why[video].dettagli.charAt(1)=="g"){
				obj.why[video].dettagli="none";
			}else{
				obj.why[video].dettagli=obj.why[video].dettagli.substring(1,2);
			}
		}
		else if(obj.why[video].dettagli.charAt(0)=="d"||obj.why[video].dettagli.charAt(0)=="g"){
			obj.why[video].dettagli="none";
		}
		//controlli su audience
		if (obj.why[video].audience==undefined){
			obj.why[video].audience="none";
		}
		if (obj.why[video].audience.charAt(0)=="A"||obj.why[video].audience.charAt(0)=="a"){
			if(obj.why[video].audience.charAt(1)=="+"){
				
				
					obj.why[video].audience=obj.why[video].audience.substring(2,5);
				
			}
			else if(obj.why[video].audience.charAt(1)=="d"||obj.why[video].dettagli.charAt(0)=="g"){
				obj.why[video].audience="gen";
			}else{
				obj.why[video].audience=obj.why[video].audience.substring(1,4);
			}
			
		}
		else if(obj.why[video].audience.charAt(0)=="d"||obj.why[video].audience.charAt(0)=="g"){
			obj.why[video].audience="gen";
		}
	

		outputTitolo = '<li >' + '<img class="video-image" onclick="playThisVideo(\''+obj.why[video].id+'\')" width="50%" height="50%" src="https://img.youtube.com/vi/' +
		obj.why[video].id +'/hqdefault.jpg" alt="YouTube Video"/>' + '<div  style=" width=50%; float: right;"><p><b> '+obj.why[video].titolo+'</b><br>purpose: why<br>lingua: ' +
		obj.why[video].lingua+'<br>categoria: '+obj.why[video].categoria+'<br>audience: '+obj.why[video].audience+'<br>dettagli: '+obj.why[video].dettagli+'</p></div></li>';
		$("#listavideo").append(outputTitolo);
	}

}


function playThisVideo(id){
	console.log(id);
	$("#youtube-video").html('');
	outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + id + '"></iframe>'+ '</li>';
		$("#youtube-video").append(outputTitolo);

}



/*************** FILTRI **************/


function getValuesFiltro() { //crea un oggetto con i campi selezionati
	
	 	var Oggetto = {
	 		lingua: document.getElementById("selectlingua").value,
	 		audience: document.getElementById("selectAudience").value,
	 		categoria: document.getElementById("categoria").value,
		 }
	return Oggetto;
}

//prendo in input l'oggetto del luogo dove ho cliccato e ritorna un oggetto filtrato

function filtraVideo(oggInCuiSono) {
	var newObject = new Object;
	newObject.what = new Array;
	newObject.how = new Array;
	newObject.why = new Array;

	oggfiltro = getValuesFiltro();
	//var arrayvideo = luogoInCuiSono.video;

	for (var cat in oggInCuiSono) {

		for (var video in oggInCuiSono[cat]) {



			//caso in cui tutti i campi sono vuoti
			if (oggfiltro.lingua == "" && oggfiltro.audience == "" && oggfiltro.categoria == "") {
				newObject[cat].push(oggInCuiSono[cat][video]);
			}
			//casi in cui due dei tre campi sono vuoti
			else if (oggfiltro.audience == "" && oggfiltro.categoria == "" && oggfiltro.lingua != "") {

				if (oggfiltro.lingua == oggInCuiSono[cat][video].lingua) {
					newObject[cat].push(oggInCuiSono[cat][video]);
				}
			} else if (oggfiltro.lingua == "" && oggfiltro.categoria == "" && oggfiltro.audience != "") {
				if (oggfiltro.audience == oggInCuiSono[cat][video].audience) {
					newObject[cat].push(oggInCuiSono[cat][video]);
				}
			} else if (oggfiltro.audience == "" && oggfiltro.lingua == "" && oggfiltro.categoria != "") {
				if (oggfiltro.categoria == oggInCuiSono[cat][video].categoria) {
					newObject[cat].push(oggInCuiSono[cat][video]);
				}
			}
			//casi in cui solo un campo dei tre è vuoto
			else if (oggfiltro.audience == "" && oggfiltro.lingua != "" && oggfiltro.categoria != "") {
				if (oggfiltro.categoria == oggInCuiSono[cat][video].categoria && oggfiltro.lingua == oggInCuiSono[cat][video].lingua) {
					newObject[cat].push(oggInCuiSono[cat][video]);
				}
			} else if (oggfiltro.audience != "" && oggfiltro.lingua == "" && oggfiltro.categoria != "") {
				if (oggfiltro.categoria == oggInCuiSono[cat][video].categoria && oggfiltro.audience == oggInCuiSono[cat][video].audience) {
					newObject[cat].push(oggInCuiSono[cat][video]);
				}
			} else if (oggfiltro.audience != "" && oggfiltro.lingua != "" && oggfiltro.categoria == "") {
				if (oggfiltro.lingua == oggInCuiSono[cat][video].lingua && oggfiltro.audience == oggInCuiSono[cat][video].audience) {
					newObject[cat].push(oggInCuiSono[cat][video]);
				}
			}
			//caso in cui tutti i campi sono compilati
			else if (oggfiltro.audience != "" && oggfiltro.lingua != "" && oggfiltro.categoria != "") {
				if (oggfiltro.lingua == oggInCuiSono[cat][video].lingua && oggfiltro.audience == oggInCuiSono[cat][video].audience && oggfiltro.categoria == oggInCuiSono[cat][video].categoria) {
					newObject[cat].push(oggInCuiSono[cat][video]);
				}
			}

		}

	}
	
	popolaDivVideo(newObject); 


}




function prevLuogo() {
	console.log(luoghiVisitati);
	if(luoghiVisitati.length>1){
		var obj = luoghiVisitati.pop();
	

	
		var lat = OpenLocationCode.decode(obj).latitudeCenter;
		var lng = OpenLocationCode.decode(obj).longitudeCenter;
		var position = new google.maps.LatLng(lat, lng);
		posizioneattuale = position;
		oggProvvisorio[obj] = new Object;
		oggProvvisorio[obj] = VideoRicevuti[obj]; 
		
	
		return oggProvvisorio[obj];
	}else{
		return null;
	}
	
}

var luoghiVisitati = new Array;
var arrivo;

function nextLuogo(position, flag) { //ritorna il luogo più vicino
	var OLC = OpenLocationCode.encode(position.lat(), position.lng());
	var arraydistanza = new Array();
	var luogopiuvicino;
	var spherical = google.maps.geometry.spherical;
	

	for (let luogo in VideoRicevuti) {
		if (luogo == OLC) {
			
			if(jQuery.isEmptyObject(oggProvvisorio)){
				return null;
			}else{
				luoghiVisitati.push(luogo);
				if(flag==false){
					delete oggProvvisorio[luogo];
				}
			}
		}
	}


	for (let luogo in oggProvvisorio) {

		var latogg = OpenLocationCode.decode(luogo).latitudeCenter;
		var lngogg = OpenLocationCode.decode(luogo).longitudeCenter;
		var positionOgg = new google.maps.LatLng(latogg, lngogg); //posizione luogo da confrontare
		var distanza = spherical.computeDistanceBetween(position, positionOgg);
		arraydistanza.push(distanza);
		if (distanza <= Math.min.apply(null, arraydistanza)) {
			
			luogopiuvicino = oggProvvisorio[luogo];
			posizioneattuale = positionOgg; //settiamo posizione attuale 
			arrivo=luogo; //arrivo e la pos dove deve andare con calculateandisplayroute
		}

	}
	
	return luogopiuvicino;
}



var videoPos;
var arraywhy= new Array();
window.onload = function () {
	initCoords();

	$("#wheremi").click(function () {
		
	
		videoPos = nextLuogo(posizioneiniziale, true);
		popolaWhat(videoPos);
		popolaDivVideo(videoPos);
		arraywhy=videoPos.why;
		document.getElementById("wheremi").style.display="none";
		
	});

	$("#nextLuogo").click(function () {
		directionsRenderer.set('directions', null);
		videoPos=nextLuogo(posizioneattuale, false);
		if(videoPos!=null){
			popolaWhat(videoPos);
			popolaDivVideo(videoPos);
			arraywhy=videoPos.why;
		}
		
	});

	$("#prevLuogo").click(function () {
		directionsRenderer.set('directions', null);
		videoPos=prevLuogo();
		if(videoPos!=null){
			popolaWhat(videoPos);
			popolaDivVideo(videoPos);
			arraywhy=videoPos.why;
		}
		
	});

	$("#how").click(function () {
		console.log(posizioneattuale);
		popolaHow(videoPos);
		LatLentoID(posizioneattuale);

	});

	$("#more").click(function () {
		
		if(arraywhy.length!=0){
		
			$("#youtube-video").html('');
			outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + arraywhy.pop().id + '"></iframe>'+ '</li>';
				$("#youtube-video").append(outputTitolo);
		}
			
		else{
			console.log('non ci sono piu why e facciamo vedere gli how');
			popolaHow(videoPos);
			LatLentoID(posizioneattuale)
		}
		

	});

	$("#filtraButton").click(function () {
		filtraVideo(videoPos);
		//chiudo div e cancello i campi 
		document.getElementById("openFilter").style.display="none";
		document.getElementById("selectlingua").value="";
	 	document.getElementById("selectAudience").value="";
	 	document.getElementById("categoria").value="";

	});


}


function popolaWhat(obj) {
	
	document.getElementById("bacicci").style.display = "block";
	$("#youtube-video").html('');
	

	if (obj.what.length != 0) {
		outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + obj.what[0].id + '"></iframe>'+ '</li>';
		$("#youtube-video").append(outputTitolo);
	}
	else if(obj.why.length != 0){
		outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + obj.why[0].id + '"></iframe>' + '</li>';
		$("#youtube-video").append(outputTitolo);
	}
	else{
		outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + obj.how[0].id + '"></iframe>' + '</li>';
		$("#youtube-video").append(outputTitolo);

	}
}



function popolaHow(videoPos){

	var lat = OpenLocationCode.decode(arrivo).latitudeCenter;
	var lng = OpenLocationCode.decode(arrivo).longitudeCenter;
	var position = new google.maps.LatLng(lat, lng);
	var directionsService = new google.maps.DirectionsService;
	calculateAndDisplayRoute(directionsService, directionsRenderer,posizioneiniziale,position);
	posizionepartenza=position;

if (videoPos.how.length!=0) {
	$("#youtube-video").html('');
	outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + videoPos.how[0].id + '"></iframe>'+ '</li>';
	$("#youtube-video").append(outputTitolo);
}else{
	$("#youtube-video").html('');
	outputTitolo = '<li> Non ci sono video HOW </li>';
	$("#youtube-video").append(outputTitolo);
}


}


function LatLentoID(pos) {
	var service;
	service = new google.maps.places.PlacesService(map);

	var request = {
		location: pos,
		radius: '10'
	}

	service.nearbySearch(request, function (results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			arraydistanza=[];
			var spherical = google.maps.geometry.spherical;
			

			var place; 

			for(var i=0;i<status.length;i++){
			var posizionerequest= new google.maps.LatLng(results[i].geometry.location.lat(),results[i].geometry.location.lng())

			var distanza = spherical.computeDistanceBetween(pos, posizionerequest);
			arraydistanza.push(distanza);
		if (distanza <= Math.min.apply(null, arraydistanza)) {
			
			var place = results[i];//se trova dei luoghi allora prendo il primo luogo aka il più vicino
				}
			}
			 console.log(place)
			var placeID = place.place_id; //prendo il suo placeID
			getOrari(placeID); //stampa su console gli orari se ci sono
		}
	});
}

var text="";
function getOrari(placeID) {
	
	var service;
	service = new google.maps.places.PlacesService(map);

	var request = {
		placeId: placeID,
		fields: ['opening_hours']
	};
	
	service.getDetails(request, function (place, status) {
		
			if (status === google.maps.places.PlacesServiceStatus.OK) {

				if (place.hasOwnProperty('opening_hours')) {
					if (place.opening_hours.hasOwnProperty('weekday_text')) {
						console.log(place.opening_hours.weekday_text);
					
						
						for (i = 0; i < place.opening_hours.weekday_text.length; i++) {
							text += place.opening_hours.weekday_text[i] + "<br>";
						}
						
					} 
				} 
				riempiCampoOrari(text); //ancora da creare
				text="";
			}
	});
	
}


function riempiCampoOrari(text){
	if(text!=""){

			$("#listavideo").html('');

				outputTitolo = '<h2> Orari di Apertura:</h2><br><li>' + text +  '</li>';
				$("#listavideo").append(outputTitolo);
		
	}else{
		$("#listavideo").html('');
				outputTitolo = '<li> Orari non disponibili </li>';
				$("#listavideo").append(outputTitolo);
	}

}





// OPEN BROWSER AND CLOSE PREVIEW


function openBrowser(target){
	document.getElementById("browser-section").style.display = "block";
	document.getElementById("hideCarousel").style.display = "none";
}
function closeBacicci(){
	document.getElementById("bacicci").style.display = "none";
	luoghiVisitati=[];
	oggProvvisorio = JSON.parse(JSON.stringify(VideoRicevuti));
	document.getElementById("wheremi").style.display="block";
	posizioneattuale=posizioneiniziale;
}
function openCloseFilter(){
	var filter = document.getElementById("openFilter");
	if (filter.style.display === "block"){
		filter.style.display="none";
	}
	else if (filter.style.display === "none"){
		filter.style.display="block";
	}
}
//CAROUSEL BUTTON
$(function () {
    $('#homeCarousel').carousel({
        interval:3000,
        pause: "false"
    });
    $('#playButton').click(function () {
        $('#homeCarousel').carousel('cycle');
    });
    $('#pauseButton').click(function () {
        $('#homeCarousel').carousel('pause');
    });	
});

function showBar(show) { //mostra o nasconde barra posizione
	var bottone = document.getElementById('set-position');
	var barra = document.getElementById('pos');
	if (show == true) {
		bottone.style.visibility = 'hidden';
		barra.style.visibility = 'visible';
	} else {
		bottone.style.visibility = 'visible';
		barra.style.visibility = 'hidden';
	}
}


