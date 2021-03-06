function Map()
{	
	var self = this; 

	this.bounds;

	this.map;

	this.defaultIcon;

	this.highlightedIcon;

	this.infoWindow;

	this.mapsApiKey;

	this.startingLocation = {lat: 47.609646, lng: -122.342117};

	self.searchBox;

	this.nearbyPlaces;

	this.smallMarker;

	this.largeMarker; 

	this.defaultMarkers = [];

	this.nearbyMarkers = [];

	this.nearbyPlaces = [];

	this.geocodeBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json?";

	self.initMap = function() {
		self.map = new google.maps.Map(document.getElementById('map'), {
			center: self.startingLocation, 
			zoom: 12,
			enableTouchUI: true
		});

		self.service = new google.maps.places.PlacesService(self.map);

		///Create bounds var
		self.bounds = new google.maps.LatLngBounds;

		///Create infowindow obj 
		self.infoWindow = new google.maps.InfoWindow({
			content: '',
			maxWidth: 200
		});

		self.smallMarker = new google.maps.MarkerImage(
				'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|0091ff|40|_|%E2%80%A2',
			    // This marker is 20 pixels wide by 32 pixels high.
			    new google.maps.Size(20, 32),
			    // The origin for this image is (0, 0).
			    new google.maps.Point(0, 0),
			    // The anchor for this image is the base of the flagpole at (0, 32).
			    new google.maps.Point(0, 32),
			    ///scaled size
			    new google.maps.Size(10, 16));

		self.largeMarker = new google.maps.MarkerImage(
				'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|0091ff|40|_|%E2%80%A2',
			    // This marker is 20 pixels wide by 32 pixels high.
			    new google.maps.Size(20, 32),
			    // The origin for this image is (0, 0).
			    new google.maps.Point(0, 0),
			    // The anchor for this image is the base of the flagpole at (0, 32).
			    new google.maps.Point(10, 32),
			    ///scaled size
			    new google.maps.Size(20, 32));
		

		//self.searchBox = new google.maps.places.SearchBox(document.getElementById("search-text"));
		
		//self.searchBox.setBounds(self.bounds);


		document.getElementById('search-button').addEventListener('click', function(){
			//executeSearch();
		})



		viewModel.placesList().forEach(function(place, index){
			self.locateAndCreateMarkers(place, self.largeMarker);
		});

	}

	this.searchPlacesByType = function(currentPlace, placeType){
		self.getPlaces(currentPlace, 2000, placeType);
	}

	this.searchPlacesByArea = function(location, radius){
		self.getPlaces(location, radius, "", "");
	}


	this.mapsError = function(){
		var mapDiv = docuement.getElementById('map');
		alert("Error!");
		///innerhtml to an error message
	}

	this.locateAndCreateMarkers = function(location, size) {
		var geoCoder = new google.maps.Geocoder();
		var request = {
			address: location.requestAddress()
		};


		geoCoder.geocode(request, function(results, status){
			if (status === google.maps.GeocoderStatus.OK) {
				self.createMarker(results[0], location, size);			
			}
			else {
				alert("Geocode unsuccessful, error: " + status);
			}
		})
	}

	this.createMarker = function(results, locationInfo, size){
			var lat = results.geometry.location.lat();
			var lng = results.geometry.location.lng();
			var address = results.formatted_address;

			
			///add name after determining what part of address to get
			var marker = new google.maps.Marker({
				icon: size,
				map: self.map,
				animation: google.maps.Animation.DROP,
				position: {lat: lat, lng: lng}
			})
			self.bounds.extend(marker.position);

			
			if (size.scaledSize.height === 32){
				self.defaultMarkers.push(marker);
				var placesRadius = 500;
				google.maps.event.addListener(marker, 'click', function(){
					self.showInfo(this, locationInfo.name());					 
					self.searchPlacesByArea(locationInfo, placesRadius);
					viewModel.setCurrentPlace(locationInfo);	
					viewModel.clearPlaces();
					self.setBounds(self.getNearbyMarkers());
				});
			} else if (size.scaledSize.height === 16){
				google.maps.event.addListener(marker, 'click', function(){
					self.showInfo(this, results.name);	
					console.log(results, locationInfo, size);
					$("#nearby-places-" + results.index).collapse();			
				});

				self.nearbyMarkers.push(marker);

			}



			//self.map.fitBounds(self.bounds);
		}; 

		this.getNearbyMarkers = function(){
			return self.nearbyMarkers;
		}


	this.setBounds = function(markers){
		console.log(markers);
		self.newBounds = new google.maps.LatLngBounds;

		markers.forEach(function(marker){
			self.newBounds.extend(marker.position);
		});
		console.log(self.newBounds);
		self.map.fitBounds(self.newBounds);
	}


	this.getPlaces = function(location, radius, placesType, size) {
		///make request for places

		var self = this; 

		if (placesType === "" || placesType === undefined) {
			placesType = viewModel.placeType().key;
		}

		request = {
			location: { lat: location.lat(), lng: location.lng() },
			radius: radius,
			type: [placesType]
		}

		if (self.nearbyMarkers.length > 0){
			self.nearbyMarkers.forEach(function(data){
				data.setMap(null);
			})
		}

		self.nearbyPlaces = [];

		self.service.nearbySearch(request, function(results, status){
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				if (results.length < 10 && radius < 3000)
				{
					self.getPlaces(location, (radius += 500), placesType)
				} else {
					var resultsSize = (results.length > 10) ? 10 : results.length;
					for (var i = 0; i < resultsSize; i++){
						results[i].index = i;	
						self.nearbyPlaces.push(results[i]);				
						self.createMarker(results[i], size, self.smallMarker);

					}
					viewModel.changeNearbyPlaces(self.nearbyPlaces);
				}	
			} else
			{
				if (radius < 3000)
				{
					self.getPlaces(location, (radius += 500), placesType);
				}
			}
		})
		weather.currentLatLngWeather(location);

		//weather.forecastCity(location);

		///populate the sidebar for that item
	}



	this.showInfo = function(marker, name){
		self.infoWindow.marker = marker;
		self.infoWindow.setContent(name);
		self.infoWindow.maxWidth = 500;
		self.infoWindow.open(self.map, marker);

	}

}

var gMap; 

var initMap = function() {
	gMap = new Map();
	gMap.initMap();
}