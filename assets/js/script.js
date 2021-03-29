//////                         Globals                                          //////

// Store the elements related to the city search.
var citySearch = document.querySelector(".city-search");
var searchBTN = document.querySelector(".search-button");

// Store the elements related to the search history.
var clearBTN = document.querySelector(".clear-history-button");
var historyContainer = document.querySelector(".history-container");
var searchHistory = [];

// Store the elements related to the current city/weather.
var cityName = document.querySelector(".name");
var currentTemp = document.getElementById("temperature");
var currentHumid = document.getElementById("humidity");
var currentWindSpeed = document.getElementById("wind-speed");
var currentUVIndex = document.getElementById("UV-index");

// Our key to access the openWeatherAPI.
const API_KEY = "3e489ce8dda72471348fca8795447d05";

//////                          Main                                            //////



// When the search button is clicked.
searchBTN.addEventListener("click", function(){
    storeSearch();
    apiCalls(citySearch.value);
})
// When the search bar is clicked into. 
citySearch.addEventListener("focus", function() {
    //Clear any previous text.
    citySearch.value = "";
})

// Clear the search history.
clearBTN.addEventListener("click", function(){
    searchHistory = [];
    localStorage.clear();
    while (historyContainer.firstChild){
        historyContainer.removeChild(historyContainer.firstChild);
    }
})
// When the page loads/reloads
window.addEventListener("load", function() {
    //Get the list of cities from local storage.
    var entry = JSON.parsel(localStorage.getItem("searchHistory"))
    //If the list is not null make the history the list from storage.
    //if the list is null make the history blank.
    searchHistory = (entry)? entry : [];

    //Create the new elements for each item in history. 
    for (i = 0; i < searchHistory.length; i++) {
        createEle(searchHistory[i]);
    }
    //Call the API for the most recently added city. 
    if (entry) {
        apiCalls(searchHistory[searchHistory.length - 1]); 
    }
})


//////                        Functions                                         //////

// Used to call the openWeather API.
function apiCalls(city){
    // Call the API.
    // The purpose of this call is to get the name/latitude/longitude of the city.
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + API_KEY)
    .then(response => response.json())
    .then(data => {
        // Store the name/latitude/longitude in variables.
        cityName.textContent = data['name'];
        var lon = data['coord']['lon'];
        var lat = data['coord']['lat'];
        // Make a new API call.
        // The purpose of this call is to get all the weather data.
        // Note: Some of the weather data is available from the previous call but not all of it.
        // So we need to make a different call using the coordinates.
        fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY + "&units=imperial")
        .then(response => response.json())
        .then(data => {
            // Log all of the data from our API call.
            console.log(data);

            // Set the URL for the weather icon.
            var weatherIcon = data['current']['weather']['0']['icon'];
            var iconURL="https://openweathermap.org/img/wn/"+weatherIcon +"@2x.png";

            // Get the current date.
            var date = new Date(data['current']['dt']*1000).toLocaleDateString();
            cityName.innerHTML += " " + date + "<img src="+iconURL+">";

            // Start retrieving all of the required weather data.
            currentTemp.textContent = data['current']['temp'] + "°F";
            currentHumid.textContent = data['current']['humidity'] + "%";
            currentWindSpeed.textContent = data['current']['wind_speed'] + "mph";
            currentUVIndex.textContent = data['current']['uvi'];
        })
    })
}


function storeSearch(){
    if (!searchHistory.includes(citySearch.value)){
        searchHistory.push(citySearch.value);
        createEle(citySearch.value);
    }
    for (i = 0; i < searchHistory.length; i++){
        localStorage.setItem(i, searchHistory[i]);
    }
}

function createEle(value){
    var newEle = document.createElement("li");
    newEle.classList.add("prev-search");
    newEle.classList.add("list-group-item");
    newEle.textContent = value.toUpperCase();
    historyContainer.appendChild(newEle);

    addClickEvents(newEle);
}

function addClickEvents(ele){
    ele.addEventListener("click", function(){
        apiCalls(ele.textContent);
    })
}