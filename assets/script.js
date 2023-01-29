
let searchInput = document.getElementById("search-input");
let todaySection = document.getElementById("today");
let forecastSection = document.getElementById("forecast");

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

function renderLastSearchButtons(event, cityName) {
    event.preventDefault();

    // let cityName = searchInput.value;

    if (!cityName) {
        alert("Please write a city");
        return;
    }

    let lastSearchList = document.createElement("ul");
    document.querySelector(".list-group").appendChild(lastSearchList);
    let cityButton = document.createElement("button");
    cityButton.setAttribute("type", "submit");
    cityButton.innerText = cityName;
    lastSearchList.appendChild(cityButton);

}

function fetchCity(cityName) {
    let APIKey = "4a57a390d1ee8b328124d4af372fdaec";
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIKey}`;

    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (cityData) {

            renderCity(cityData);
            fetchForecast(cityData);
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

document.getElementById("search-button").addEventListener("click", function (event) {
    let cityName = searchInput.value;
    event.preventDefault();

    fetchCity(cityName);
    renderLastSearchButtons(event, cityName);

    searchInput.value = "";
});

function renderForecast(forecastData) {
    let fiveDaysData = {};
    let fiveDaysMaxTemp = [];
    let today = moment();
    forecastSection.innerHTML = "";

    createObjectFiveDaysData(forecastData, fiveDaysData);
    let forecastHeader = document.createElement("h4");
    forecastHeader.textContent = "5-Day Forecast:";
    forecastSection.appendChild(forecastHeader);
    let forecastDiv = document.createElement("div");
    forecastDiv.classList.add("d-flex", "justify-content-between");
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


