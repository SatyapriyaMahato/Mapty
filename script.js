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

navigator.geolocation.getCurrentPosition(function (position) {

    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const cords = [latitude, longitude];

    const map = L.map('map').setView(cords, 15);

    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    L.marker(cords)
        .addTo(map)
        .bindPopup("<b>Hello world!</b><br>I am a popup.")
        .openPopup();


    /************* Add marker on clicked position  ***********/

    map.on('click', function (mapEvent) {
        const { lat } = mapEvent.latlng;
        const { lng } = mapEvent.latlng;
        const clickedCords = [lat, lng];

        console.log(clickedCords);
        L.marker(clickedCords)
            .addTo(map)
            .bindPopup("<b>Hello world!</b><br>I am a popup.")
            .openPopup();
    })

}, function () {
    alert("couldn't get your position");

});