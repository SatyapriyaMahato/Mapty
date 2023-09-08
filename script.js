'use strict';

// DOM elements
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Workout class
class Workout {
    ID = (Date.now() + '').slice(-10);
    date = new Date();

    constructor(coords, distance, duration) {
        this.distance = distance;
        this.duration = duration;
        this.coords = coords; //[lat, lng]
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} ${this.type == "running" ? "🏃‍♂️" : "🚴‍♀️"} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

// Running class
class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

// Cycling class
class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// App class
class App {
    #zoomLevel = 15;
    #map;
    #mapEvent;
    #mapEvents = [];
    #activities = [];
    #markers = [];

    constructor() {
        this._getPosition();
        this._getLocalStorage();

        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField);
        containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert("couldn't get your position");
            });
        }
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, this.#zoomLevel);

        L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(this.#map);

        L.marker(coords)
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

        // Render the markers after a refresh as it should be after the load of the map
        this.#activities.forEach(wo => {
            this._renderWorkoutMarker(wo);
        })
    }

    _showForm(mapE) {

        this.#mapEvent = mapE;

        this.#mapEvents.push(this.#mapEvent);
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

        // Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // Check if the data is valid or not
        if (type === "running") {
            const cadence = +inputCadence.value;
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert("Enter valid input");
            }
            // If workout is running, create a running object
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        if (type === "cycling") {
            const elevation = +inputElevation.value;
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) {
                return alert("Enter valid input");
            }
            // If workout is cycling, create a cycling object
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // Add a new object to the workout array
        this.#activities.push(workout);

        // Render workout on the map as a marker
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
        this._hideForm();
        this._setLocalStorage();
    }

    _renderWorkoutMarker(workout) {
        const marker = new L.marker(workout.coords)
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

        this.#markers.push(marker);
    }

    _removeWorkoutMarker(m) {
        this.#map.removeLayer(m);
    }

    _renderWorkout(workout) {
        let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.ID}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__modify">
          <span class="workout__edit__icon">&#10000</span>
          <span class="workout__del__icon">&#10005</span>
        </div>
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
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li> `
        }
        form.insertAdjacentHTML("afterend", html);

        const editBtn = document.querySelector(".workout__edit__icon");
        const delBtn = document.querySelector(".workout__del__icon");

        delBtn.addEventListener("click", this._delWorkout.bind(this));
        editBtn.addEventListener("click", this._editWorkout.bind(this));

    }

    _delWorkout(e) {
        const workoutEl = e.target.closest(".workout");
        if (!workoutEl) return;

        const workoutId = workoutEl.dataset.id;
        const workoutIndex = this.#activities.findIndex((obj) => obj.ID === workoutId);

        if (workoutIndex !== -1) {

            const workoutMarker = this.#markers[workoutIndex];
            this.#map.removeLayer(workoutMarker);

            this.#activities.splice(workoutIndex, 1);
            this.#markers.splice(workoutIndex, 1);

            workoutEl.remove();

            this._setLocalStorage();
        }
    }

    _editWorkout(e) {
        const workoutEl = e.target.closest(".workout");
        if (!workoutEl) return;

        const workoutId = workoutEl.dataset.id;
        const workoutIndex = this.#activities.findIndex((obj) => obj.ID === workoutId);
        form.classList.remove("hidden");
        this.#activities.splice(workoutIndex, 1);

        if (workoutIndex !== -1) {

            const clickedPoint = this.#mapEvents[workoutIndex];
            this.#mapEvent = clickedPoint;
            workoutEl.remove();

            this._setLocalStorage();

        }

    }

    _hideForm() {
        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
        form.style.display = "none";
        form.classList.add("hidden");

        setTimeout(() => form.style.display = "grid", 1000);
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest(".workout");

        if (e.target.closest(".workout__modify")) return;
        if (!workoutEl) return;

        const workoutId = workoutEl.dataset.id;

        const workout = this.#activities.find(wo => wo.ID === workoutId);

        this.#map.setView(workout.coords, this.#zoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        })
    }

    _setLocalStorage() {
        localStorage.setItem("workouts", JSON.stringify(this.#activities));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem("workouts"));

        if (!data) return;

        this.#activities = data;

        this.#activities.forEach(wo => {
            this._renderWorkout(wo);
        })
    }

    reset() {
        localStorage.removeItem("workouts");
        location.reload();
    }
}

// Initialize the app
const app = new App();
