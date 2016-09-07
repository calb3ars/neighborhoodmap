///to be replaced by proper Google Maps Places objects
var favoritePlaces = [
	{
		name: 'Space Needle',
		street: '400 Broad St',
		lat: 47.620412,
		lng: -122.349277,
		city: 'Seattle'
	},
	{
		name: 'Gas Works Park',		
		lat: 47.654941,
		lng: -122.335205,
		street: '2101 N Northlake Way',
		city: 'Seattle'
	},
	{
		name: 'Farmers\' Market West Seattle',
		lat: 47.56116,
		lng: -122.386807,
		street: 'California Ave SW and SW Alaska St',
		city: 'Seattle'
	},
	{
		name: 'Volunteer Park',
		lat: 47.630056,
		lng: -122.314932,
		street: '1247 15th Ave E',
		city: 'Seattle'
	},
	{
		name: 'Seward Park',
		lat: 47.55067,
		lng: -122.256290,
		street: '5900 Lake Washington Blvd S',
		city: 'Seattle'
	}
]
var initLocations = function(){
	var bufferArray = ko.observableArray([]);

	var index = 0;

	favoritePlaces.forEach(function(location) {
		location.index = index++;
		bufferArray().push(new Place(location));
	});

	return bufferArray();
}

var Model = function () {
    this.defaultLocations = initLocations();
    this.nearbyVisible = ko.observable(false);
    this.nearbyList = initLocations();
    this.nearbyPlacesTypes 
    this.currentPlace = this.defaultLocations[0];
    this.currentWeather = ko.observable();
    this.weatherForecast = ko.observableArray(); 
};

var Place = function(data) {
	var self = this; 

	var state = 'WA'
	var lat = data.geometry ? data.geometry.location.lat() : data.lat;
	var lng = data.geometry ? data.geometry.location.lng() : data.lng;

	this.index = ko.observable(data.index);
	this.name = ko.observable(data.name);
	this.lat = ko.observable(lat);
	this.lng = ko.observable(lng);
	this.street = ko.observable(data.street);
	this.city = ko.observable(data.city);
	this.state = ko.observable(state);

	this.priceLevel = ko.observable(data.price_level);

	this.priceText = ko.computed(function(){
		var text = "$";	
		if(typeof(self.priceLevel()) === 'number'){
			return text.repeat(self.priceLevel());
		} else {
			return "";
		}
	})
	this.ratings = ko.observable(data.rating); 
	this.types = ko.observableArray(data.types);
	this.type = ko.observable(data.types ? data.types[0] : "none");

	this.address = ko.computed(function() { 
		return self.street() + ", " + self. city() + ", " + self.state() 
	});
	this.requestAddress = ko.computed(function() {
		return self.address().replace(/ /g, "+")
	});

	this.nearbyPlacesHTML = ko.observable('<button type="button" class="btn btn-info" data-toggle="collapse" data-target="#nearby-places">Button</button><div class="collapse" id="nearby-places"><li data-bind="text: rating"></li><li data-bind="text: priceLevel"></li><li data-bind="text: type"></li></div>')
}



var ViewModel = function() {

	///to avoid any confusion later
	var self = this;

	this.model = new Model(); 

	this.nearbyPlacesList = ko.observableArray([]);

	this.placesList = ko.computed(function() {
		return self.model.defaultLocations;
	}, this);



	this.currentPlace = ko.observable(self.model.defaultLocations[0]);

	this.hasCurrentPlace = true; 


	this.logPlaces = function(){
		console.log(self.nearbyPlacesList().length);
		//this.nearbyPlacesList().forEach(function(place){
		//	console.log(place.name());
		//})
	};

	this.createPlace = function(defaultLocations) {
		var index = 0;
		defaultLocations.forEach(function(place){
			place.index = index++;
			self.model.defaultLocations.push(new Place(place)); 
		});
	};

	this.nearbyPlacesVisible = ko.computed(function(){
    	return self.model.nearbyVisible();
    })

    this.clearPlaces = function(){
    	self.nearbyPlacesList([]);
    }

	this.changeNearbyPlaces = function(nearbyPlaces){
		self.nearbyPlacesList([]);

		nearbyPlaces.forEach(function(place){
			self.nearbyPlacesList.push(new Place(place));
		});

		
		self.model.nearbyVisible(true);

		var nearbyItem = document.getElementById("nearby-places-item")
		//nearbyItem.className = "collapse('show')";
	};

	this.setCurrentPlace = function(location){
		self.currentPlace(self.model.defaultLocations[location.index()]);
		console.log(self.currentPlace().name());
	}


	this.setCurrentWeather = function(weather){
		self.model.currentWeather(weather);
		console.log("set current weather");
		console.log(self.model.currentWeather().weather[0].main);
	}

	this.currentWeather = ko.computed(function() {
		return self.model.currentWeather();
	})


}

var viewModel = new ViewModel();

ko.applyBindings(viewModel);
