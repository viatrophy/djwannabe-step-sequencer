"use strict";

const Samplebox = require('./samplebox');
// const $ = require('jquery');
let idCounter = 0;

function Desktop() {
    let wrapper = document.querySelector('#wrapper');
    let channelDiv = document.querySelector('#snaptarget');
    let removeButton = document.querySelector('#remove-sample');
    let sampleList = document.querySelector('#sample-list'); //The list with the samples

    /**
     * Sends audiosample path to the samplebox function
     */
    sampleList.addEventListener('click', function(event) {
        Samplebox(idCounter, $(event.target).text());
        idCounter += 1;
    });

    removeButton.addEventListener('click', function(event) {
        
    });


}

module.exports = Desktop;





