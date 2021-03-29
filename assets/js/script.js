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

            storeSearch(city);

            // Set the url for weather Icon.
            var weatherIcon = data['current']['weather']['0']['icon'];
            var iconURL="https://openweathermap.org/img/wn/"+weatherIcon +"@2x.png";

            // Get the current date.
            var date = new Date(data['current']['dt']*1000).toLocaleDateString();
            cityName.innerHTML += " " + date + "<img src="+iconURL+">";

            // Start retrieving all of the required weather data.
            currentTemp.textContent = data['current']['temp'] + "°F";
            currentHumid.textContent = data['current']['humidity'] + "%";
            currentWindSpeed.textContent = data['current']['wind_speed'] + "mph";

            // Logic for the UV index indicator
            var uvi = data['current']['uvi'];
            var uviIndicator = ""
            // These tags use bootstrap to change the color of the UV index element.
            if (uvi <= 2){
                uviIndicator = "bg-success";
            } else if (uvi > 2 && uvi <= 5){
                uviIndicator = "bg-warning";
            } else if (uvi > 5){
                uviIndicator = "bg-danger";
            }
            // Remove any of the tags from previous searches.
            currentUVIndex.classList.remove("bg-success");
            currentUVIndex.classList.remove("bg-warning");
            currentUVIndex.classList.remove("bg-danger");

            // Add the class to the element
            currentUVIndex.classList.add(uviIndicator);
            currentUVIndex.textContent = uvi;

            // Collect data for the future forecast.
            futureForecast(data);
        })
    })
}

// Store the search history in both an array, and in local storage.
function storeSearch(city){
    // If the array does NOT(!) contain the city.
    if (!searchHistory.includes(city)){
        // Add the city to the array.
        searchHistory.push(city);
        // Create a new element that goes into the search history container.
        createEle(city);
    }
    // Store the array in local storage.
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    console.log(searchHistory);
}

// Create a new element for the newly searched city.
function createEle(value){
    // Create a new list element.
    var newEle = document.createElement("li");
    // Add this class tag for use in css.
    newEle.classList.add("prev-search");
    // Add this class tag for bootstrap use.
    newEle.classList.add("list-group-item");
    // Update the text content of the new element to the city name.
    newEle.textContent = value.toUpperCase();

    // Add the new element to the container.
    historyContainer.appendChild(newEle);

    // Add event listner for clicking to the new element.
    newEle.addEventListener("click", function(){
        // Call the API when the element is clicked.
        apiCalls(newEle.textContent.toLowerCase());
    })
}

// Gather weather data for the future forecast.
function futureForecast(data){
    // Max number of days that will be forecasted.
    const MAX_FORECAST = 5;
    // Go through each of the days.
    for (i = 0; i < MAX_FORECAST; i++){
        // Get each element needed for that day.
        var currDate = document.getElementById("forecastDate" + i);
        var currIcon = document.getElementById("forecastImg" + i);
        var currTemp = document.getElementById("forecastTemp" + i);
        var currHumid = document.getElementById("forecastHumidity" + i);

        // Create the new date for the current day.
        var date = new Date(data["daily"][i]['dt']*1000).toLocaleDateString();
        currDate.textContent = date;

        // Get the weather icon to be used for the current day.
        var weatherIcon = data['daily'][i]['weather']['0']['icon'];
        var iconURL="https://openweathermap.org/img/wn/"+weatherIcon +"@2x.png";
        currIcon.innerHTML = "<img src="+iconURL+">";

        // Gather the temperature and humidity for the current day.
        currTemp.textContent = data['daily'][i]['temp']['day'] + "°F";
        currHumid.textContent = data['daily'][i]['humidity'] + "%";
    }
}