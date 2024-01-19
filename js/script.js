import { AppData, HtmlElement } from "./request.js";


// классы, которые отвечают за переключение меню, управление блоками и отправкой запросов
class BaseBlockHandler {
    #isError;

    // работа с ошибками
    set IsError(value) {
        if (this.#isError != value) {
            this.#isError = value;
        }
    }

    get IsError() {
        return this.#isError;
    }

    // работа с переключением активного меню
    setActiveMenu(blockMenu) {
        blockMenu.classList.add("active-menu");
    }

    resetActiveMenu(blockMenu) {
        blockMenu.classList.remove("active-menu");
    }

    // работа с показом и удалением блоков
    hideBlock(block) {
        if (!block.classList.contains("hide")) {
            block.classList.add("hide");
        }
    }

    showBlock(block) {
        if (block.classList.contains("hide")) {
            block.classList.remove("hide");
        }
    }
}

class TodayBlockHandler extends BaseBlockHandler {
    static block;
    static blockMenu;
    static weatherRequest;

    async sendRequest(city) {
        if (!await TodayBlockHandler.weatherRequest.send(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${AppData.apiKey}&units=metric`, "CURRENT_WEATHER")) {
            return false;
        }
        return await TodayBlockHandler.weatherRequest.send(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${AppData.apiKey}&units=metric&cnt=${AppData.countHourlyDay}`, "HOURLY_TODAY");
    }

    async sendRequestCoords(latitude, longitude) {
        if (!await TodayBlockHandler.weatherRequest.send(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${AppData.apiKey}&units=metric`, "CURRENT_WEATHER")) {
            return false;
        }
        return await TodayBlockHandler.weatherRequest.send(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${AppData.apiKey}&units=metric&cnt=${AppData.countHourlyDay}`, "HOURLY_TODAY");
    }

    setActiveMenu() {
        super.setActiveMenu(TodayBlockHandler.blockMenu);
    }

    resetActiveMenu() {
        super.resetActiveMenu(TodayBlockHandler.blockMenu);
    }

    hideBlock() {
        super.hideBlock(TodayBlockHandler.block);
    }

    showBlock() {
        super.showBlock(TodayBlockHandler.block);
    }
}

class FiveDayBlockHandler extends BaseBlockHandler {
    static block;
    static blockMenu;
    static weatherRequest;

    async sendRequest(city) {
        if (!await FiveDayBlockHandler.weatherRequest.send(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${AppData.apiKey}&units=metric`, "FIVE_DAY")) {
            return false;
        }
        return await FiveDayBlockHandler.weatherRequest.send(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${AppData.apiKey}&units=metric&cnt=${AppData.countHourlyDay}`, "HOURLY_TODAY");
    }

    setActiveMenu() {
        super.setActiveMenu(FiveDayBlockHandler.blockMenu);
    }

    resetActiveMenu() {
        super.resetActiveMenu(FiveDayBlockHandler.blockMenu);
    }

    hideBlock() {
        super.hideBlock(FiveDayBlockHandler.block);
    }

    showBlock() {
        super.showBlock(FiveDayBlockHandler.block);
    }
}

class HourlyBlockHandler extends BaseBlockHandler {
    static block;

    hideBlock() {
        super.hideBlock(HourlyBlockHandler.block);
    }

    showBlock() {
        super.showBlock(HourlyBlockHandler.block);
    }
}

// управляющий класс для блоков
class ContentsBlockHandler {
    static hourlyBlockHandler;  // почасовой блок, т.к. он находится и в меню 'Today' и 'FiveDay'
    static errorBlockHandler;  // блок ошибки
    #curBlockHandler;  // открытое меню

    constructor(curBlockHandler) {
        this.#curBlockHandler = curBlockHandler;
    }

    // отправка запросов
    async sendRequest(city) {
        // если запрос прошел успешно, то скрываем блок ошибки
        if (await this.#curBlockHandler.sendRequest(city)) {
            ContentsBlockHandler.errorBlockHandler.hideBlock();
        }
        else {
            ContentsBlockHandler.errorBlockHandler.showBlock();
        }
    }

    async sendRequestCoords(latitude, longitude) {
        // если запрос прошел успешно, то скрываем блок ошибки
        if (await this.#curBlockHandler.sendRequestCoords(latitude, longitude)) {
            ContentsBlockHandler.errorBlockHandler.hideBlock();
        }
        else {
            ContentsBlockHandler.errorBlockHandler.showBlock();
        }
    }

    // переключение меню
    set CurBlockHandler(value) {
        const isErr = this.checkError();

        if (!isErr) { this.hideBlock(); }  // если нет ошибки, прячем блок

        this.#curBlockHandler.resetActiveMenu();  // меняем активное меню и сохраняем
        this.#curBlockHandler = value;
        this.#curBlockHandler.setActiveMenu();

        this.handleErrorState(isErr);  // установка флага ошибки
    }

    handleErrorState(value) {
        // меняем вывод почасового блока, только когда менеятся состояние ошибки (true, false)
        if (value) {
            ContentsBlockHandler.hourlyBlockHandler.hideBlock();  // прячем hourlyBlock и сам блок
            this.hideBlock();
        }
        else {
            ContentsBlockHandler.hourlyBlockHandler.showBlock();  // выводим hourlyBlock и сам блок
            this.showBlock();
        }
        this.#curBlockHandler.IsError = value;
    }

    checkError() {
        return this.#curBlockHandler.IsError;
    }

    hideBlock() {
        this.#curBlockHandler.hideBlock();
    }
    
    showBlock() {
        this.#curBlockHandler.showBlock();
    }
}

class ErrorHandler extends BaseBlockHandler {
    static block;
    #contentBlockHandler;

    constructor(contentBlockHandler) {
        super();
        this.#contentBlockHandler = contentBlockHandler;
    }

    hideBlock() {
        this.#contentBlockHandler.handleErrorState(false);  // ошибки нет
        super.hideBlock(ErrorHandler.block);
    }

    showBlock() {
        this.#contentBlockHandler.handleErrorState(true);  // ошибка есть
        super.showBlock(ErrorHandler.block);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // установка статических полей для классов и глобальных объектов, которые отвечают за переключение меню и управление блоками
    TodayBlockHandler.block = HtmlElement.todayBlock;
    TodayBlockHandler.blockMenu = HtmlElement.todayMenu;
    TodayBlockHandler.weatherRequest = AppData.weatherRequest;
    FiveDayBlockHandler.block = HtmlElement.fiveDayBlock;
    FiveDayBlockHandler.blockMenu = HtmlElement.fiveDayMenu;
    FiveDayBlockHandler.weatherRequest = AppData.weatherRequest;
    HourlyBlockHandler.block = HtmlElement.hourlyBlock;
    ContentsBlockHandler.hourlyBlockHandler = new HourlyBlockHandler;
    ErrorHandler.block = HtmlElement.errorBlock;
    AppData.contentBlockHandler = new ContentsBlockHandler(new TodayBlockHandler);
    AppData.errorHandler = new ErrorHandler(AppData.contentBlockHandler);
    ContentsBlockHandler.errorBlockHandler = AppData.errorHandler;

    // обработчики
    HtmlElement.fiveDayMenu.addEventListener("click", () => {
        AppData.contentBlockHandler.CurBlockHandler = new FiveDayBlockHandler();
        checkErrorForSend();
    });
    HtmlElement.todayMenu.addEventListener("click", () => {
        AppData.contentBlockHandler.CurBlockHandler = new TodayBlockHandler();
        checkErrorForSend();
    });

    HtmlElement.searchCity.addEventListener("keypress", (e) => {
        if (["NumpadEnter", "Enter"].includes(e.code)) {  // если нажат enter
            processSearchInput();  // запускаем процесс поиска города
        }
    });
    HtmlElement.searchBtn.addEventListener("click", processSearchInput);

    for (let block of HtmlElement.slideCards) {
        block.addEventListener("click", clickCardDay);
    }

    // находим город по геолокации
    definitionUserCity();
});


function setActiveCardDay(cardDay) {
    for (let card of HtmlElement.slideCards) {
        card.classList.remove("active-card");
    }
    cardDay.classList.toggle("active-card");  // выделяем новый выбранный блок
}

function clickCardDay(e) {
    const numday = e.currentTarget.dataset.numday;  // номер дня

    // диапазон данных для конкретного дня (один день равен 8 записям)
    const fromIndex = (numday - 1) * 8;
    const toIndex = fromIndex + 7;
    const range = {
        fromIndex: fromIndex,
        toIndex: toIndex
    };
    AppData.weatherRequest.parseHourlyDay(range);  // парсим данные
    setActiveCardDay(e.currentTarget);  // выделяем новый выбранный блок
}

function checkErrorForSend() {
    if (!AppData.contentBlockHandler.checkError()) {
        processSearchInput();  // если ошибки не было, то отправляем запрос
    }
}

async function processSearchInput() {
    const city = HtmlElement.searchCity.value;
    if (city === "") {  // если строка поиска пустая, то выдаём ошибку
        AppData.errorHandler.showBlock();
        return;
    }
    setActiveCardDay(HtmlElement.slideCards[0]);  // выделяем первый выбранный блок в 'Five-day block' (по умолчанию)
    AppData.contentBlockHandler.sendRequest(city);  // запускаем процессы обработки запросов
}

async function processSearchInputByCoords(latitude, longitude) {
    await AppData.contentBlockHandler.sendRequestCoords(latitude, longitude);  // запускаем процессы обработки запросов
    HtmlElement.searchCity.value = AppData.weatherRequest.city;  // отображаем город в строке поиска
}

async function defaultProcessRequest() {
    await AppData.contentBlockHandler.sendRequest("London");
    HtmlElement.searchCity.value = AppData.weatherRequest.city;
}

async function definitionUserCity() {
    // если браузер поддерживает геолокацию
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;  // широта
                const longitude = position.coords.longitude;  // долгота
                processSearchInputByCoords(latitude, longitude);
            },
            async (err) => {
                console.log(err.message);
                await defaultProcessRequest();  // запускаем процессы обработки запросов по умолчанию
            }, { enableHighAccuracy: true, timeout: 3000 }
        );
    }
    else {
        await defaultProcessRequest();  // запускаем процессы обработки запросов по умолчанию
    }
}
