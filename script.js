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



let map, mapEvent;
navigator.geolocation.getCurrentPosition(function (position) {

    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const cords = [latitude, longitude];

    map = L.map('map').setView(cords, 15);

    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    L.marker(cords)
        .addTo(map)
        .bindPopup(L.popup({
            maxwidth: 250,
            minwidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: ".leaflet-popup",
        }))
        .setPopupContent("current position")
        .openPopup();

    /************* Add marker on clicked position  ***********/

    map.on('click', function (mapE) {
        mapEvent = mapE;
        inputDistance.focus();
        form.classList.remove("hidden");

    })

}, function () {
    alert("couldn't get your position");

});

form.addEventListener("submit", function (e) {
    e.preventDefault();

    inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';

    const { lat, lng } = mapEvent.latlng;

    L.marker({ lat, lng })
        .addTo(map)
        .bindPopup(L.popup({
            maxwidth: 250,
            minwidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: "cycling-popup"

        }))
        .setPopupContent("Cycling")
        .openPopup();

})


//  handel toggle
inputType.addEventListener("change", function () {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
})