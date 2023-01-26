
let searchInput = document.getElementById("search-input");
let todaySection = document.getElementById("today");
let forecastSection = document.getElementById("forecast");
let today = moment();


function fetchCity(cityName) {
    let APIKey = "4a57a390d1ee8b328124d4af372fdaec";
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIKey}`;

    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (cityData) {

            function renderCity() {
                todaySection.innerHTML =
                    `<div class=city-date-icon style="
                    display: flex;
                    align-items: center;">
                    <h2 id="city-name-date"> ${cityData.name} ${today.format("(DD/MM/YYYY)")} </h2>
                    <img id="city-icon" src="http://openweathermap.org/img/wn/${cityData.weather[0].icon}@2x.png" height="60px">
                    </div>
                    <div class=city-data-today>
                    <p id="temperature"> Temperature: ${cityData.main.temp} ºC </p>
                    <p id="wind"> Wind speed: ${cityData.wind.speed} m/s </p>
                    <p id="humidity"> Humidity: ${cityData.main.humidity}% </p>
                    </div>`;
            }
            renderCity();
            fetchForecast(cityData);

        });
}

function fetchForecast(cityData) {
    let APIKey = "4a57a390d1ee8b328124d4af372fdaec";
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&appid=${APIKey}`;

    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (forecastData) {

            function renderForecast() {
                console.log(forecastData);
                forecastSection.innerHTML =
                    `<h5> 5-Day Forecast </h5>`;
            }
            renderForecast();
        });
}


document.getElementById("search-button").addEventListener("click", function (event) {
    let cityName = searchInput.value;
    event.preventDefault();

    fetchCity(cityName);
});