'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
}

class Running extends Workout {
    type = "running";
    constructor(cords, distance, duration, cadenece) {
        super(cords, distance, duration);
        this.cadenece = cadenece;
        this.calcPace();
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

        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';

        // render workout on map as a marker
        this.renderWorkoutMarker(workout);

    }

    renderWorkoutMarker(workout) {
        L.marker(workout.cords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxwidth: 250,
                minwidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: "cycling-popup"

            }))
            .setPopupContent(workout.type)
            .openPopup();

    }

}

const app = new App();
