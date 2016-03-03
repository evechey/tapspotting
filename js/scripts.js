
Date.prototype.mmdd = function() {
   var mm = this.getMonth() < 9 ? (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
   var dd  = this.getDate() < 10 ? this.getDate() : this.getDate();
   return [mm, dd].join('/');
 };

 function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

//Allow User to Search for location2
//Bind search key to kick off foursquare search
//Return list of locations
//Show via dropdown list to user
//Bind each location to an untappd ajax call
//On click return recent checkins based off of foursquare ID
//show list of checkins

tapspotting = function(){
	//define variabls
	var locationSearched = false;
	var searchText = '';
	var currentLocation = ''; 
	var venues = {};
	var useGeoLocation = true;
	var searchForm = document.getElementById("searchForm");
	var locationSection = document.querySelector(".locationSection");
	var beerSection = document.querySelector(".beerSection");
	var loadingSection = document.querySelector(".loadingSection");
	var errorSection = document.querySelector(".errorSection");
	var locationSearchError = document.querySelector(".locationSearchError");
	var getUntappdIDError = document.querySelector(".getUntappdIDError");
	var getBeerCheckinsError = document.querySelector(".getBeerCheckinsError");
	var locationSelector = document.getElementById("locationSelector");
	var locationSelectorContainer = document.getElementById("locationSelectorContainer");
	var locationSearchText = document.getElementById("locationSearchText");
	var locationSearchTextContainer = document.getElementById("locationSearchTextContainer");
	var userGeoLocationLabel = document.getElementById("userGeoLocationLabel");
	var locationName = document.getElementById("locationName");

	return {
		init: function(){
			this.getGeoLocation();
			this.bindHandlers();
		},
        bindHandlers: function() {
		  	document.getElementById('userGeoLocation').onchange=function(){
		  		if(this.checked){
					locationSelectorContainer.className = 'mui-col-md-5 hide'; 
					locationSearchTextContainer.className = locationSearchTextContainer.className.replace(/\bmui-col-md-5\b/g, "mui-col-md-10");
					locationSelector.required = false;    
					useGeoLocation = true;      	   
		  		} else {
					locationSelectorContainer.className = 'mui-col-md-5'; 
					locationSearchTextContainer.className = locationSearchTextContainer.className.replace(/\bmui-col-md-10\b/g, "mui-col-md-5");
					locationSelector.required = true; 
					useGeoLocation = false;
		  		}
		  	};
		},
		getGeoLocation: function(){
			if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition(tapspotting.setUserLocationByGeo, tapspotting.requireUserLocation, {timeout:5000});
		    } else { 
		        locationSelectorContainer.className = 'mui-col-md-5';
		        locationSearchTextContainer.className = locationSearchTextContainer.className.replace(/\bmui-col-md-10\b/g, "mui-col-md-5");
		        searchForm.className = searchForm.className.replace(/\bhide\b/g, " ");
		        loadingSection.className += loadingSection.className ? ' hide' : 'hide';
		    }
		},
		setUserLocationByGeo: function(position){
			locationSelector.required = false;
			currentLocation = "ll=" + position.coords.latitude + "," + position.coords.longitude;
			locationSearchTextContainer.className = "mui-col-md-10";
			loadingSection.className += loadingSection.className ? ' hide' : 'hide';
			searchForm.className = searchForm.className.replace(/\bhide\b/g, " ");
		},
		requireUserLocation: function(){
			locationSelector.required = true; 
			useGeoLocation = false;
			locationSelectorContainer.className = 'mui-col-md-5'; 
			locationSearchTextContainer.className = locationSearchTextContainer.className.replace(/\bmui-col-md-10\b/g, "mui-col-md-5");
			userGeoLocationLabel.className += userGeoLocationLabel.className ? ' hide' : 'hide';
			loadingSection.className += loadingSection.className ? ' hide' : 'hide'; 
			searchForm.className = searchForm.className.replace(/\bhide\b/g, " ");
		},
		locationSearch: function(){
			errorSection.className += errorSection.className ? ' hide' : 'hide';
	    	locationSearchError.className += locationSearchError.className ? ' hide' : 'hide';
	    	getUntappdIDError.className += getUntappdIDError.className ? ' hide' : 'hide';
	    	getBeerCheckinsError.className += getBeerCheckinsError.className ? ' hide' : 'hide';

			// Grab text from input box
		    text = document.getElementById('locationSearchText').value;
		    userLocation = document.getElementById('locationSelector').value;

		    if(text !== '' && (userLocation !== '' || currentLocation !== '')){
			    if(useGeoLocation){
			    	userLocation = currentLocation;
			    } else {
			    	userLocation = "near=" + userLocation;
			    }
			    var xhr = new XMLHttpRequest();
			    xhr.onreadystatechange = function() {
			        if (xhr.readyState == XMLHttpRequest.DONE ) {
			           if(xhr.status == 200){
							var locationResponses = {};
							locationResponses = JSON.parse(xhr.responseText);
							venues = locationResponses.response.venues;
							tapspotting.populateLocationTable(venues)
			           }
			           else if(xhr.status == 400) {
			           }
			           else {
			              
			               loadingSection.className += loadingSection.className ? ' hide' : 'hide';
			           	   errorSection.className = errorSection.className.replace(/\bhide\b/g, " ");
			           	   locationSearchError.className = locationSearchError.className.replace(/\bhide\b/g, " ");
			           }
			        }
			    }
			    xhr.open('GET', 'https://api.foursquare.com/v2/venues/search?' 
			    	+ userLocation 
			    	+ '&query=' 
			    	+ text 
			    	+ '&client_id=1VKLKHYOWM1R2RWKBHBVUBTMGOPQSSMRS23YFNBB1QCHA3U2&client_secret=F33MMFS5BL4E231D00RULJWQE4UF2X2KBUJ2P55XJFV5JD0Y&v=20150716', true);
				loadingSection.className = loadingSection.className.replace(/\bhide\b/g, " ");
			    xhr.send();
			}
			return false;
		},
		populateLocationTable: function(data){
			t1 = document.getElementById('locationTable');
			contentToAppend = "";
			if(!isEmpty(data)){
				for (var key in data) {
	            	individualLocation = data[key];
	            	contentToAppend += ' <div class="mui-row"><div class="mui-col-md-12"><div class="location mui-panel" id="'+individualLocation.id+'" data-name="' + individualLocation.name + '">'+individualLocation.name + ' - ' + individualLocation.location.address + ', ' + individualLocation.location.city + '</div></div></div>'
	        	
	        	}
	        	t1.innerHTML = contentToAppend;
	        	beerSection.className += beerSection.className ? ' hide' : 'hide';
	        	loadingSection.className += loadingSection.className ? ' hide' : 'hide';
				locationSection.className = locationSection.className.replace(/\bhide\b/g, " ");
				locationSection.scrollIntoView( true );
	        	tapspotting.bindLocations();
        	} else {
					loadingSection.className += loadingSection.className ? ' hide' : 'hide';
	           	    errorSection.className = errorSection.className.replace(/\bhide\b/g, " ");
	           	    locationSearchError.className = locationSearchError.className.replace(/\bhide\b/g, " ");
        	}
		},
		bindLocations: function(){
			var locationsToBind = document.getElementsByClassName("location");
			for (var key in locationsToBind) {
				locationsToBind[key].onclick = function(){
					locationSection.className += locationSection.className ? ' hide' : 'hide';
					if(this.getAttribute('data-name')){
						locationName.innerHTML = "at " + this.getAttribute('data-name');
					}
					tapspotting.getUntappdID(this.id);
				} 
			}
		},
		getUntappdID: function(foursquareID){
			if(foursquareID !== ''){
			    var xhr = new XMLHttpRequest();
			    xhr.onreadystatechange = function() {
			        if (xhr.readyState == XMLHttpRequest.DONE ) {
			           if(xhr.status == 200){
							var locationResponse = {};
							locationResponse = JSON.parse(xhr.responseText);
							tapspotting.getBeerCheckins(locationResponse.response.venue.items[0].venue_id);
			           }
			           else if(xhr.status == 400) {
			           }
			           else {
			               loadingSection.className += loadingSection.className ? ' hide' : 'hide';
			               errorSection.className = errorSection.className.replace(/\bhide\b/g, " ");
			           	   getUntappdIDError.className = getUntappdIDError.className.replace(/\bhide\b/g, " ");
			           }
			        }
			    }
			    xhr.open('GET', 'https://api.untappd.com/v4/venue/foursquare_lookup/' 
			    	+ foursquareID 
			    	+ '?client_id=5182BE79A73BFA58E091DA46EC8FEFAE5EBB2FD5'
			    	+ '&client_secret=E8CB28BD7D950F6A7D244765BDBD69BA8C64C35E'
			    	);
			    loadingSection.className = loadingSection.className.replace(/\bhide\b/g, " ");
			    xhr.send();
			}
		},
		getBeerCheckins: function(locationID){
			if(locationID !== ''){
			    var xhr = new XMLHttpRequest();
			    xhr.onreadystatechange = function() {
			        if (xhr.readyState == XMLHttpRequest.DONE ) {
			           if(xhr.status == 200){
							var locationResponse = {};
							locationResponse = JSON.parse(xhr.responseText);

							tapspotting.populateBeerTable(locationResponse.response.checkins.items);
			           }
			           else if(xhr.status == 400) {
			           }
			           else {
			               loadingSection.className += loadingSection.className ? ' hide' : 'hide';
			               errorSection.className = errorSection.className.replace(/\bhide\b/g, " ");
			           	   getBeerCheckinsError.className = getBeerCheckinsError.className.replace(/\bhide\b/g, " ");
			           }
			        }
			    }
			    xhr.open('GET', 'https://api.untappd.com/v4/venue/checkins/' 
			    	+ locationID 
			    	+ '?client_id=5182BE79A73BFA58E091DA46EC8FEFAE5EBB2FD5'
			    	+ '&client_secret=E8CB28BD7D950F6A7D244765BDBD69BA8C64C35E'
			    	);
			    xhr.send();
			}
		},
		populateBeerTable: function(data){
			t1 = document.getElementById('beerTable');
			contentToAppend = "<table class='rwd-table'><tr><th>Beer</th><th>Brewery</th><th>Style</th><th class='alignRight'>ABV</th><th class='alignRight'>Rating (0-5)</th><th class='alignRight'>Date</th></tr>";
			var arr = data;
			arr.sort( function( a, b){ return a.beer.bid - b.beer.bid; } );
			// delete all duplicates from the array
			for( var i=0; i<arr.length-1; i++ ) {
			  if ( arr[i].beer.bid == arr[i+1].beer.bid ) {
			    delete arr[i];
			  }
			}
			// remove the "undefined entries"
			arr = arr.filter( function( el ){ return (typeof el !== "undefined"); } );
			arr = arr.sort(tapspotting.compareDates);
			arr = arr.reverse();
			for (var key in arr) {
            	individualBeer = arr[key];
            	var newDate = new Date(individualBeer.created_at);
            	var formattedDate = newDate.mmdd();
            	contentToAppend += '<tr><td data-th="Beer">' + individualBeer.beer.beer_name
            	+ '</td><td data-th="Brewery">' + individualBeer.brewery.brewery_name
            	+ '</td><td data-th="Style">' + individualBeer.beer.beer_style
            	+ '</td><td data-th="ABV" class="alignRight">' + individualBeer.beer.beer_abv
            	+ '% </td><td data-th="Rating (0-5)" class="alignRight">' + individualBeer.rating_score
            	+ '</td><td data-th="Date" class="alignRight">' + formattedDate

            	+ '</td></tr>';
        	}
        	contentToAppend += "</table>"
        	t1.innerHTML = contentToAppend;
        	loadingSection.className += loadingSection.className ? ' hide' : 'hide';
			beerSection.className = beerSection.className.replace(/\bhide\b/g, " ");
			beerSection.scrollIntoView( true );
		},
		compareDates: function(a,b){
			if (a.checkin_id < b.checkin_id)
			  return -1;
			if (a.checkin_id > b.checkin_id)
			  return 1;
			return 0;
		}
    }
}();

window.onload = function () {
	tapspotting.init();
}
