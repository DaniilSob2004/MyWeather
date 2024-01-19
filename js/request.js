import { AppData, HtmlElement, WeatherDate } from "./globals.js"

export { AppData, HtmlElement };  // экспор глобальных объектов


class WorkRequest {
    #method;  // метод запроса

    constructor(method) {
        this.#method = method;
    }

    async sendRequest(url) {
        try {
            const response = await fetch(url, { method: this.#method });
            const json = await response.json();
            if (response.ok) {
                return json;
            }
            else {
                throw new Error(`HTTP error! Status: ${response.status}; Error: ${json}`);
            }
        }
        catch (err) {
            throw new Error(`Network error occurred; Error: ${err}`);
        }
    }
}

// экспор класса
export class WeatherRequest extends WorkRequest {
    // типы запросов для получение конкретных данных, с вызовами методов для обработки этих данных
    static TypeFormatDate = {
        "CURRENT_WEATHER": function(data) { this.parseCurWeatherData(data) },
        "HOURLY_TODAY": function(data) { this.parseHourlyDate(data, { fromIndex: 0, toIndex: AppData.countHourlyDay - 1 }) },
        "FIVE_DAY": function(data) { this.parseFiveDay(data) }
    };

    #data;  // сохраняем данные(json), чтобы при переключении дней, не отправлять запрос
    city;  // название города, по которому идет запрос

    constructor(method) {
        super(method);
        this.city = "";
    }

    async send(url, dateFormat) {
        // отправляем запрос и обрабатываем ответ
        let isError = false;
        await this.sendRequest(url)
            // находим в словаре нужный метод и вызываем
            .then(data => WeatherRequest.TypeFormatDate[dateFormat].call(this, data))
            .catch((err) => { isError = true; console.log(err); });
        return !isError;
    }

    parseCurWeatherData(data) {
        this.city = data.name;  // сохраняем название города
        try {
            // загружаем данные в блок 'current weather'
            WeatherDate.dateNow.innerText = AppData.dateFormat.getDateNow(data.timezone);
            WeatherDate.curIcon.src = `https://api.openweathermap.org/img/w/${data.weather[0].icon}.png`;
            WeatherDate.curDescrip.innerText = data.weather[0].description;
            WeatherDate.tempValue.innerText = `${Math.round(data.main.temp)}°C`;
            WeatherDate.realTempValue.innerText = `${Math.round(data.main.feels_like)}°C`;
            WeatherDate.sunrise.innerText = `${AppData.dateFormat.getFromSecondsHM(data.sys.sunrise, data.timezone)} AM`;
            WeatherDate.sunset.innerText = `${AppData.dateFormat.getFromSecondsHM(data.sys.sunset, data.timezone)} PM`;
            WeatherDate.durationDay.innerText = `${AppData.dateFormat.getDurationDateHM(data.sys.sunrise, data.sys.sunset)} hr`;
        }
        catch (err) {
            throw new Error(`Error: ${err}`);
        }
    }

    parseFiveDay(data) {
        this.#data = data;  // сохраняем данные
        try {
            // загружаем данные в блок 'five days card'
            for (let i = 0, j = 0; i < data.list.length; i += 8, j++) {
                const forecast = data.list[i];

                const day = HtmlElement.slideCards[j].querySelector(".head-text");
                day.innerText = AppData.dateFormat.getDayFromSeconds(forecast.dt, data.city.timezone);

                const date = HtmlElement.slideCards[j].querySelector(".value-text");
                date.innerText = AppData.dateFormat.getFromSecondsMDHM(forecast.dt, data.city.timezone);

                const img = HtmlElement.slideCards[j].querySelector("img");
                img.src = `https://api.openweathermap.org/img/w/${forecast.weather[0].icon}.png`;

                const temp = HtmlElement.slideCards[j].querySelector(".temp-value");
                temp.innerText = `${Math.round(forecast.main.temp)}°C`;

                const descrip = HtmlElement.slideCards[j].querySelector(".descrip");
                descrip.innerText = forecast.weather[0].description;
            }
        }
        catch (err) {
            throw new Error(`Error: ${err}`);
        }
    }

    parseHourlyDay(range) {
        this.parseHourlyDate(this.#data, range);
    }

    parseHourlyDate(data, range) {
        try {
            // загружаем данные в блок 'hourly'
            const tableRows = WeatherDate.hourlyTable.querySelectorAll("tr");
            tableRows[0].querySelectorAll("th")[0].innerText =
                `${AppData.dateFormat.getDayFromSeconds(data.list[range.fromIndex].dt, data.city.timezone)}-
                 ${AppData.dateFormat.getDayFromSeconds(data.list[range.toIndex].dt, data.city.timezone)}`

            for (let i = range.fromIndex, j = 0; i <= range.toIndex; i++, j++) {
                const forecast = data.list[i];
                tableRows[0].querySelectorAll("th")[j + 1].innerText = AppData.dateFormat.getFromSecondsHM(forecast.dt, data.city.timezone);
                tableRows[1].querySelectorAll("td")[j + 1].querySelector("img").src = `https://api.openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
                tableRows[2].querySelectorAll("td")[j + 1].innerText = forecast.weather[0].description;
                tableRows[3].querySelectorAll("td")[j + 1].innerText = `${Math.round(forecast.main.temp)}°`;
                tableRows[4].querySelectorAll("td")[j + 1].innerText = `${Math.round(forecast.main.feels_like)}°`;
                tableRows[5].querySelectorAll("td")[j + 1].innerText = Math.round(forecast.wind.speed);
            }
        }
        catch (err) {
            throw new Error(`Error: ${err}`);
        }
    }
}

// устанвливаем значения шлобальным объектам
AppData.weatherRequest = new WeatherRequest("GET");
