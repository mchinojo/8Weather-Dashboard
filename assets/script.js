
let searchInput = document.getElementById("search-input");
let todaySection = document.getElementById("today");
let forecastSection = document.getElementById("forecast");
let searchedCitiesArray = JSON.parse(localStorage.getItem('searched-cities')) || [];


function renderCity(cityData) {
    let today = moment();
    todaySection.classList.add("border", "border-dark");
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

function updateCitiesArray(cityName) {

    if (!cityName) {
        alert("Please write a city");
        return;
    }

    searchedCitiesArray.push(cityName);
    if (searchedCitiesArray.length > 6) {
        searchedCitiesArray.shift();
    }
    localStorage.setItem('searched-cities', JSON.stringify(searchedCitiesArray));
}

function renderLastSearchButtons() {


    document.querySelector(".list-group").innerHTML = "";
    for (let index = 0; index < searchedCitiesArray.length; index++) {
        let searchedCity = searchedCitiesArray[index];
        searchedCity = searchedCity.charAt(0).toUpperCase() + searchedCity.slice(1);
        let cityButton = document.createElement("button");
        cityButton.setAttribute("type", "submit");
        cityButton.classList.add("city-button", "btn", "btn-primary", "btn-block");
        cityButton.innerText = searchedCity;
        document.querySelector(".list-group").prepend(cityButton);
    }


}

function fetchCity(cityName, renderButton) {
    let APIKey = "4a57a390d1ee8b328124d4af372fdaec";
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIKey}`;

    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (cityData) {

            if (cityData.cod === 200) {

                renderCity(cityData);
                fetchForecast(cityData);
                if (renderButton) {

                    updateCitiesArray(cityName)
                    renderLastSearchButtons();
                }


            } else {
                alert("Something went wrong, please try again.");
            }
        });
}

function getMaxTemp(day, fiveDaysData) {
    let maxTemp = -1000;
    let objWithMaxTemp = {};

    for (let index = 0; index < fiveDaysData[day].length; index++) {

        if (fiveDaysData[day][index].temp > maxTemp) {
            maxTemp = fiveDaysData[day][index].temp;
            objWithMaxTemp = fiveDaysData[day][index];

        }
    }
    return objWithMaxTemp;
}

function renderForecast(forecastData) {
    let fiveDaysData = {};
    let fiveDaysMaxTemp = [];
    let today = moment();
    forecastSection.innerHTML = "";

    createObjectFiveDaysData(forecastData, fiveDaysData);
    let forecastHeader = document.createElement("div");
    forecastHeader.innerHTML =
        `<div id="forecast-header">
    <h4> 5-Day Forecast </h4> </div>`;
    forecastSection.appendChild(forecastHeader);
    let forecastDiv = document.createElement("div");
    forecastDiv.classList.add("row", "justify-content-between");
    forecastSection.appendChild(forecastDiv);

    for (let index = 0; index < Object.keys(fiveDaysData).length; index++) {
        let day = Object.keys(fiveDaysData)[index];

        fiveDaysMaxTemp.push(getMaxTemp(day, fiveDaysData));

    }

    for (let index = 0; index < fiveDaysMaxTemp.length; index++) {

        let cardDiv = document.createElement("div");
        cardDiv.classList.add("card-body", "col-lg-2", "mx-2", "my-2");
        forecastDiv.appendChild(cardDiv);
        let dateHeader = document.createElement("h5");
        dateHeader.textContent = today.add(1, 'days').format("DD/MM/YYYY");
        cardDiv.appendChild(dateHeader);

        let imgWeather = document.createElement("img");
        imgWeather.src = `http://openweathermap.org/img/wn/${fiveDaysMaxTemp[index].icon}@2x.png`;
        imgWeather.setAttribute("style", "height:60px");
        cardDiv.appendChild(imgWeather);

        displayValues(`Temp: ${fiveDaysMaxTemp[index].temp} ºC`, cardDiv);
        displayValues(`Wind: ${fiveDaysMaxTemp[index].wind} m/s`, cardDiv);
        displayValues(`Humidity: ${fiveDaysMaxTemp[index].humidity} %`, cardDiv);

    }

}

function fetchForecast(cityData) {
    let APIKey = "4a57a390d1ee8b328124d4af372fdaec";
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityData.name}&units=metric&appid=${APIKey}`;

    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (forecastData) {

            renderForecast(forecastData);
        });
}

function displayValues(maxValue, cardDiv) {

    let valueText = document.createElement("p");
    valueText.textContent = maxValue;
    cardDiv.appendChild(valueText);

}

function createObjectFiveDaysData(forecastData, fiveDaysData) {
    let today = moment();

    for (let index = 0; index < forecastData.list.length; index++) {
        let days = forecastData.list[index].dt_txt;
        let formattedDays = moment(days).format("DD/MM/YYYY");
        let temperature = forecastData.list[index].main.temp;
        let wind = forecastData.list[index].wind.speed;
        let humidity = forecastData.list[index].main.humidity;
        let icon = forecastData.list[index].weather[0].icon;

        if (formattedDays === today.format("DD/MM/YYYY")) {
            continue;
        }

        if (fiveDaysData[formattedDays] === undefined) {
            fiveDaysData[formattedDays] = [];
        } else {
            fiveDaysData[formattedDays].push({ "temp": temperature, "wind": wind, "humidity": humidity, "icon": icon });
        }
    }
}

renderLastSearchButtons();

document.getElementById("search-button").addEventListener("click", function (event) {
    let cityName = searchInput.value;
    event.preventDefault();

    fetchCity(cityName, true);

    searchInput.value = "";
});

document.querySelector(".list-group").addEventListener("click", function (event) {
    if (event.target.matches("button")) {

        fetchCity(event.target.textContent, false);

    }

});


