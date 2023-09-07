'use strict';

// prettier-ignore


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout {
    ID = (Date.now() + '').slice(-10);
    date = new Date();

    constructor(cords, distance, duration) {
        this.distance = distance;
        this.duration = duration;
        this.cords = cords; //[lat, lng]
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} ${this.type == "running" ? "🏃‍♂️" : "🚴‍♀️"} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout {
    type = "running";
    constructor(cords, distance, duration, cadence) {
        super(cords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = "cycling";
    constructor(cords, distance, duration, elevationGain) {
        super(cords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();

    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}


class App {
    #map;
    #mapEvent;
    #activities = [];
    constructor() {
        this._getPosition();
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField);

    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
            alert("couldn't get your position");

        });
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const cords = [latitude, longitude];

        this.#map = L.map('map').setView(cords, 15);

        L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(this.#map);

        L.marker(cords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxwidth: 250,
                minwidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: ".leaflet-popup",
            }))
            .setPopupContent("current position")
            .openPopup();

        this.#map.on('click', this._showForm.bind(this));

    }
    _showForm(mapE) {
        this.#mapEvent = mapE;
        inputDistance.focus();
        form.classList.remove("hidden");

    }


    _toggleElevationField() {
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    }


    _newWorkout(e) {
        e.preventDefault();

        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        //  Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        const { lat, lng } = this.#mapEvent.latlng;
        let workout;


        // check if the data is valid or not
        if (type === "running") {
            const cadence = +inputCadence.value;
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert("Enter valid input");

            }
            // if workout is running create running object
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        if (type === "cycling") {
            const elevation = +inputElevation.value;
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) {
                return alert("Enter valid input");

            }
            // if workout is cycling create cycling objetct
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        //  add new objetc to workout array
        this.#activities.push(workout);



        // render workout on map as a marker
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
        this._hideForm();

    }

    _renderWorkoutMarker(workout) {
        console.log(workout);
        L.marker(workout.cords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxwidth: 250,
                minwidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`

            }))
            .setPopupContent(workout.description)
            .openPopup();

    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.ID}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.type == "running" ? "🏃" : "🚴‍♀️"}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>`;

        if (workout.type == "running") {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>`
        }

        if (workout.type == "cycling") {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevation}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li> `
        }
        form.insertAdjacentHTML("afterend", html);
    }

    _hideForm() {
        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
        form.style.display = "none";
        form.classList.add("hidden");

        setTimeout(() => form.style.display = "grid", 1000);

    }





}

const app = new App();
