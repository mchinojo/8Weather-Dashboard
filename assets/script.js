
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
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityData.name}&units=metric&appid=${APIKey}`;



    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (forecastData) {

            function renderForecast() {
                forecastSection.innerHTML =
                    `<h5> 5-Day Forecast: </h5>`;

                // for (let index = 0; index < 5; index++) {
                //     let forecastTemp = forecastData.list[index].main.temp;
                //     let forecastWind = forecastData.list[index].wind.speed;
                //     console.log(forecastTemp);
                // }

                organizeDays(forecastData);
                // console.log(forecastData);
            }
            renderForecast();
        });
}


document.getElementById("search-button").addEventListener("click", function (event) {
    let cityName = searchInput.value;
    event.preventDefault();

    fetchCity(cityName);
});


function organizeDays(forecastData) {
    let fiveDaysTemperatures = {};

    for (let index = 0; index < forecastData.list.length; index++) {
        let days = forecastData.list[index].dt_txt;
        let formattedDays = moment(days).format("DD/MM/YYYY");
        let temperature = forecastData.list[index].main.temp;

        if (fiveDaysTemperatures[formattedDays] === undefined) {
            fiveDaysTemperatures[formattedDays] = [temperature];
        } else {
            fiveDaysTemperatures[formattedDays].push(temperature);
        }
    }



    function getMaxTemp(day) {

        let maxTemp = fiveDaysTemperatures[day][0];
        for (let index = 0; index < fiveDaysTemperatures[day].length; index++) {

            if (fiveDaysTemperatures[day][index] > maxTemp) {
                maxTemp = fiveDaysTemperatures[day][index];
            }
        }

        console.log(maxTemp);
    }

    for (let index = 0; index < Object.keys(fiveDaysTemperatures).length; index++) {
        let day = Object.keys(fiveDaysTemperatures)[index];
        getMaxTemp(day);

    }

}


