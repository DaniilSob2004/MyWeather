import { DateFormatting } from "./date_formatting.js";

 // экспортируем глобальные объекты
export const AppData = {
    apiKey: "86a6b6123b3dc2b7152fd8b8cee8c0da",
    countHourlyDay: 8,
    dateFormat: new DateFormatting,
    weatherRequest: null,
    contentBlockHandler: null,
    errorHandler: null
};

export const HtmlElement = {
    todayMenu: document.getElementById("todayMenu"),
    fiveDayMenu: document.getElementById("fiveDayMenu"),
    searchCity: document.getElementById("searchCity"),
    searchBtn: document.getElementById("searchBtn"),
    todayBlock: document.querySelector(".today-block"),
    errorBlock: document.querySelector(".error-block"),
    fiveDayBlock: document.querySelector(".five-day-block"),
    hourlyBlock: document.querySelector(".hourly-block"),
    slideCards: document.querySelectorAll(".card-block")
};

export const WeatherDate = {
    dateNow: document.getElementById("dateNow"),
    hourlyTable: document.getElementById("hourlyTable"),
    curIcon: document.getElementById("curIcon"),
    curDescrip: document.getElementById("curDescrip"),
    tempValue: document.getElementById("tempValue"),
    realTempValue: document.getElementById("realTempValue"),
    sunrise: document.getElementById("sunrise"),
    sunset: document.getElementById("sunset"),
    durationDay: document.getElementById("durationDay")
};
