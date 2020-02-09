/*      PROTOTIPO OGGETTO

 var VideoRicevuti= {

 	"8FPHF8VV+F6": {
		 
 		"what": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..],
 		"how": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..],
 		"why": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..]
 	},

 	"8FPHF8DO+EP": {
		"what": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..],
		"how": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..],
		"why": [{"titolo":"bla", "id":"idvideo"..}, {}, {}..]
 	}
 }
 */


//8FPHG900+-8FPHG925+-8FPHG925+GG:what:ita:mod:A+gen:P+default#Il lab del DASPLab
//8FPHG925+HJ:what:ita:flk:Agen:P1
//8FPH0000+:8FPHF800+:8FPHF8WW+RX:what:ita:cui-prs:Agen:P1


/**************SETTAGGIO MAPPA*************/

var posizioneattuale; //posizione iniziale

var VideoRicevuti = {};

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
					oggProvvisorio = JSON.parse(JSON.stringify(VideoRicevuti));;
				});


			} catch (e) {
				console.log(e);
			}
		})



}


var map;

function PopolaMappa(oggettoOLC) {

	for (let olc in oggettoOLC) {

		var posizioneOLC = new google.maps.LatLng(OpenLocationCode.decode(olc).latitudeCenter, OpenLocationCode.decode(olc).longitudeCenter)
		stampaMarker(creaMarkerLuogo(posizioneOLC), map);
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
				markercliccato = VideoRicevuti[tmp];
				popolaDivVideo(markercliccato);
				filtraVideo(markercliccato);

			}
		}

	});

	google.maps.event.addListener(marker, 'mouseover', function () { //mostra un popup con il nome del posto
		
	});

	return marker;
}





var directionsRenderer;


function initAutocomplete(position) { // crea mappa e marker con tutte le loro funzionalità

	var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	posizioneattuale = coords;
	directionsRenderer = new google.maps.DirectionsRenderer; //servizi di google per la creazione di strade
	var directionsService = new google.maps.DirectionsService; //servizi di google per la creazione di strade
	var geocoder = new google.maps.Geocoder(); //servizio di google che converte luoghi in coordinate

	//crea l'oggetto mappa
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: coords,
	});


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



	document.getElementById('reset-map').addEventListener('click', function () { //sposta la visuale della mappa alla posizione di partenza

		//trova video intorno a te e aggiunge i marker alla mappa
		var mioOlc = OpenLocationCode.encode(position.coords.latitude, position.coords.longitude);
		var olcGrande = mioOlc.substring(0, 6) + "00+-";
	
		TrovaVideo(olcGrande);
		
		/*
		
		map.setCenter(marker.position);
		map.setZoom(15);
		*/
	});

	google.maps.event.addListener(marker, 'dragend', function () { //setta la tua posizione dopo che hai spostato il marker
		directionsRenderer.set('directions', null);
		marker.setPosition(marker.getPosition());
		posizioneattuale = marker.getPosition();

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




//crea una lista di video
function popolaDivVideo(obj) {
	document.getElementById("bacicci").style.display = "block";
	$("#listavideo").html(''); //elimino contenuto lista


	for (let video in obj.what) {
		outputTitolo = '<li id="' + obj.what[video].id + '" >' + '<img class="video-image" onclick="playThisVideo('+obj.what[video].id+')" width="50%" height="50%" src="https://img.youtube.com/vi/' 
		+ obj.what[video].id +'/hqdefault.jpg" alt="YouTube Video"/>' + '<div  style=" width=50%; float: right;"><p>Titolo: '+obj.what[video].titolo+'<br>purpose: what<br>lingua: '
		+obj.what[video].lingua+'<br>categoria: '+obj.what[video].categoria+'<br>audience: '+obj.what[video].audience+'<br>dettagli: '+obj.what[video].dettagli+'</p></div></li>';
		$("#listavideo").append(outputTitolo);
	}
	for (let video in obj.how) {
		outputTitolo = '<li id="' + obj.how[video].id + '" >' + '<img width="50%" height="auto" src="https://img.youtube.com/vi/' + obj.how[video].id +'/hqdefault.jpg" alt="YouTube Video"/>' + '</li>';
		$("#listavideo").append(outputTitolo);
	}
	for (let video in obj.why) {
		outputTitolo = '<li id="' + obj.why[video].id + '" >' + '<img width="50%" height="auto" src="https://img.youtube.com/vi/' + obj.why[video].id +'/hqdefault.jpg" alt="YouTube Video"/>' + '</li>';
		$("#listavideo").append(outputTitolo);
	}

}


function playThisVideo(id){
	$("#youtube-video").html('');
	outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + id.id + '"></iframe>'+ '</li>';
		$("#youtube-video").append(outputTitolo);

}


function showPlayerDiv(show) { //mostra o nasconde la finestra del player e audio
	var divfiltro = document.getElementById('divfiltro');
	var divplayer = document.getElementById('divplayer');
	var gotoFilter = document.getElementById('gotoFilter');
	if (show == true) {
		divfiltro.style.display = 'block';
		divplayer.style.display = 'block';
	} else {
		divfiltro.style.display = 'none';
		divplayer.style.display = 'none';
	}

}




/**********FINESTRA PLAYER E AUDIO **********/




function showBar(show) { //mostra o nasconde la finestra del player e audio

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


var player;



function onYouTubeIframeAPIReady() {

	$("#playbutton").click(toggleAudio); //se clicchi sul pulsante chiama toogleAudio

	player = new YT.Player('youtube-player', { //lega il player al div "youtube-player"
		height: '0',
		width: '0',
		//url del video (stringa a 11 caratteri, dopo youtube.com/watch?v=)
		playerVars: {
			autoplay: 0,
			loop: 0,
			origin: 'https://site181964.tw.cs.unibo.it'
		},
	});

	player.addEventListener("onStateChange", function (state) {
		if (state.data === 0) {
			togglePlayButton(false);
		}
	});


	function toggleAudio() {

		if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
			player.pauseVideo();
			togglePlayButton(false);
		} else {
			id = player.getVideoUrl().split("=")[1];
			if (!id) {
				player.loadVideoById(urlvideo[0]);
				for (var i = 0; i < urlvideo.length; i++) {
					document.getElementById(urlvideo[i]).style.color = "black";
				}
				document.getElementById(urlvideo[0]).style.color = "red";
			}

			player.playVideo();
			togglePlayButton(true);



		}
	}

	function togglePlayButton(play) {
		document.getElementById("playbutton").innerHTML = play ? "pause" : "play";
	}



	function makeAllBlack() {
		for (var i = 0; i < urlvideo.length; i++) {
			document.getElementById(urlvideo[i]).style.color = "black";
		}

	}
	$("#nextbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']); //prendo l'indice del video che è in esecuzione
		if (index == urlvideo.length - 1) { //se siamo sull'ultimo video
			player.loadVideoById(urlvideo[0]);
			makeAllBlack();
			document.getElementById(urlvideo[0]).style.color = "red";

		} else {
			player.loadVideoById(urlvideo[index + 1]);
			makeAllBlack();
			document.getElementById(urlvideo[index + 1]).style.color = "red";
		}
		player.playVideo;
		togglePlayButton(true);
	});

	$("#backbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']);
		if (index - 1 < 0) { //se siamo sul primo video
			player.loadVideoById(urlvideo[0]);
			makeAllBlack();
			document.getElementById(urlvideo[0]).style.color = "red";
		} else {
			player.loadVideoById(urlvideo[index - 1]);
			makeAllBlack();
			document.getElementById(urlvideo[index - 1]).style.color = "red";
		}
		player.playVideo;
		togglePlayButton(true);
	});



	$("#skipbutton").click(function () {

		var directionsService = new google.maps.DirectionsService;
		directionsRenderer.set('directions', null);
		var lat = document.getElementById("skipbutton").value;
		var lng = document.getElementById("skipbutton").name;
		var posizionemomentanea = new google.maps.LatLng(lat, lng);
		var nxt = nextLuogo(lat, lng);
		var coord = new google.maps.LatLng(nxt.coord.lat, nxt.coord.long)
		calculateAndDisplayRoute(directionsService, directionsRenderer, posizionemomentanea, coord);
		directionsRenderer.setMap(map);
		addToPlayer(nxt);
		document.getElementById("skipbutton").value = nxt.coord.lat;
		document.getElementById("skipbutton").name = nxt.coord.long;
	});


	$("#prevbutton").click(function () {

		var directionsService = new google.maps.DirectionsService;
		directionsRenderer.set('directions', null);
		var posizioneprecedente = arrayposizionivisitate[arrayposizionivisitate.length - 1]
		if (arrayposizionivisitate.length == 0 || arrayposizionivisitate.length == 1) {
			return 0;
		}
		for (luogo in LuoghiAlCaricamento) {
			if (LuoghiAlCaricamento[luogo].coord.lat == arrayposizionivisitate[arrayposizionivisitate.length - 2].lat() && LuoghiAlCaricamento[luogo].coord.long == arrayposizionivisitate[arrayposizionivisitate.length - 2].lng()) {
				addToPlayer(LuoghiAlCaricamento[luogo]);
				var posizionemomentanea = new google.maps.LatLng(LuoghiAlCaricamento[luogo].coord.lat, LuoghiAlCaricamento[luogo].coord.long);
				calculateAndDisplayRoute(directionsService, directionsRenderer, posizioneprecedente, posizionemomentanea);
				directionsRenderer.setMap(map);
				document.getElementById("skipbutton").value = LuoghiAlCaricamento[luogo].coord.lat;
				document.getElementById("skipbutton").name = LuoghiAlCaricamento[luogo].coord.long;
			}
		}
		arrayposizionivisitate.pop();
	});
}

/*************** FILTRI **************/


function getValuesFiltro() { //crea un oggetto con i campi selezionati
	/*
	 	var Oggetto = {
	 		lingua: document.getElementById("selectlingua").value,
	 		audience: document.getElementById("selectAudience").value,
	 		categoria: document.getElementById("categoria").value,
		 };
		 
	*/
	var Oggetto = {
		lingua: "",
		categoria: "",
		audience: ""

	};

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

function popolaWhat(obj) {
	console.log(obj)
	document.getElementById("bacicci").style.display = "block";
	$("#youtube-video").html('');
	

	if (obj.what.length != 0) {
		console.log("entrato if what")
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
var videoPos;
window.onload = function () {

	$("#wheremi").click(function () {
		videoPos = nextLuogo(posizioneattuale);
		popolaWhat(videoPos);
		popolaDivVideo(videoPos);
		
	});

	$("#nextLuogo").click(function () {
		videoPos=nextLuogo(posizioneattuale);
		popolaWhat(videoPos);
		popolaDivVideo(videoPos);
	});

	$("#prevLuogo").click(function () {
		videoPos=prevLuogo();
		popolaWhat(videoPos);
		popolaDivVideo(videoPos);
	});
	$("#how").click(function () {
		
		$("#youtube-video").html('');
		console.log(videoPos);
		if (videoPos.how.length!=0) {
			outputTitolo = '<li> <iframe width="100%" height="auto", src="' + 'https://www.youtube.com/embed/' + videoPos.how[0].id + '"></iframe>'+ '</li>';
			$("#youtube-video").append(outputTitolo);
		}else{
			alert("No Video How");
		}

		
	});
}


/*
function LuogoVicino(position) { //ritorna il luogo più vicino
	var arraydistanza= new Array();
	var luogopiuvicino;
	var spherical = google.maps.geometry.spherical;

	for (let luogo in VideoRicevuti) {

		var latogg = OpenLocationCode.decode(luogo).latitudeCenter;
		var lngogg = OpenLocationCode.decode(luogo).longitudeCenter;
		var positionOgg = new google.maps.LatLng(latogg, lngogg); //posizione luogo da confrontare
		var distanza = spherical.computeDistanceBetween(position, positionOgg);
		
		arraydistanza.push(distanza);
		if (distanza <= Math.min.apply(null, arraydistanza)) {
			luogopiuvicino = VideoRicevuti[luogo];
			posizioneattuale=positionOgg;

		}

	}
	
	return luogopiuvicino;
}
*/
function prevLuogo() {

	var obj = luoghiVisitati.pop()
	var lat = OpenLocationCode.decode(obj).latitudeCenter;
	var lng = OpenLocationCode.decode(obj).longitudeCenter;
	var position = new google.maps.LatLng(lat, lng);
	posizioneattuale = position;
	oggProvvisorio[obj] = new Object;
	oggProvvisorio[obj] = VideoRicevuti[obj]; //videoricevuti obj vuoto
	return oggProvvisorio[obj];
}

var luoghiVisitati = new Array;
function nextLuogo(position) { //ritorna il luogo più vicino
	var OLC = OpenLocationCode.encode(position.lat(), position.lng());
	var arraydistanza = new Array();
	var luogopiuvicino;
	var spherical = google.maps.geometry.spherical;

	for (let luogo in VideoRicevuti) {
		if (luogo == OLC) {
			
			luoghiVisitati.push(luogo);
			delete oggProvvisorio[luogo];
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
			posizioneattuale = positionOgg;
		}

	}
	
	return luogopiuvicino;
}


// OPEN BROWSER AND CLOSE PREVIEW
function openBrowser(){
	document.getElementById("browser-section").style.display = "block";
	document.getElementById("hideCarousel").style.display = "none";
}
function closeBacicci(){
	document.getElementById("bacicci").style.display = "none";
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