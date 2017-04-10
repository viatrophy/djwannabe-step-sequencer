'use strict';

let playChecker = true;
let wrapper = document.querySelector('#wrapper');
let inactiveSamples = document.querySelector('#inactive-samples');
let samples = [];       //Array with all current samples
let activeSamples = []; //Array with the channels current samples

let channel1 = [];      //Channel 1's list of samples
let channel2 = [];      //Channel 1's list of samples

let context = new AudioContext();


function makeDroppable(element) {
    $('#' + element).droppable({
            drop: function (event, ui) {
                
                // ui.draggable.data('droppedin',$(this));
                // $(this).droppable('disable');
                ui.draggable('disable');
            }
        });
}



for(let i = 0; i < samples.length; i++) {
    console.log(makeDroppable('slot' + 1));
}

// $(".sample-slot").droppable({
//             drop: function (event, ui) {
//                 //pop()-ish från samples[] och dra in i activeSamples[]
                
//                 let draggableId = ui.draggable.find("button").attr("data-playbuttonid");    //ta ut samplets index från sample arrayen
//                 let droppableId = $(this).attr("id");    //lägg den i index (droppableId) i playlsit arrayen

//                 activeSamples.push(samples[draggableId]);
//                 console.log(activeSamples);
//                 console.log(draggableId);
//                 console.log(droppableId);
//                 // ui.draggable.data('droppedin',$(this));
//                 // $(this).droppable('disable');
//                 ui.draggable('disable');
//             },
//             out: function(event, ui) {  
//                 // ui.draggable.find("button").attr("data-playbuttonid");
//                 // // let index = activeSamples.indexOf(audiosample);           
//                 // // activeSamples.splice(index, 1);                 //Remove the sample 
//                 // console.log('active samples: ' + activeSamples);
//                 // console.log('all samples: ' + samples);
//                 // ui.draggable.remove();
//             }
//         });

//         let sampleSlotId = 3;
//         let channelDiv = document.querySelector('#snaptarget');
//         let removeButton = document.querySelector('#remove-sample');
//         let addButton = document.querySelector('#add-sample');

//         addButton.addEventListener('click', function(event) {
//             let sampleSlot = document.createElement('div');
//             sampleSlot.setAttribute('id', 'slot' + sampleSlotId);
//             sampleSlot.classList.add('sample-slot');

//             channelDiv.appendChild(sampleSlot);

//             $(".sample-slot").droppable({
//                 drop: function (event, ui) {
//                     //pop()-ish från samples[] och dra in i activeSamples[]
                    
//                     let draggableId = ui.draggable.find("button").attr("data-playbuttonid");    //ta ut samplets index från sample arrayen
//                     let droppableId = $(this).attr("id");    //lägg den i index (droppableId) i playlsit arrayen

//                     activeSamples.push(samples[draggableId]);
//                     // ui.draggable.data('droppedin',$(this));
//                     // $(this).droppable('disable');
//                     ui.draggable('disable');
//                     sampleSlotId++;
//                 }        
//             })
//         });

/**
 * Skapar en samplebox div som är draggable + innehåller ett sample + en play knapp
 * @param id = idCounter
 * @param sample = path to sample
 */
function samplebox(id, sample) {
    $(function () {
        $('#samplebox' + id).draggable({
            revert: 'invalid',
            zIndex: 10,
            snap: '.sample-slot',
            snapMode: 'inner',
            snapTolerance: 80
        });   
    });

    let sampleBox = document.createElement('div');
    sampleBox.setAttribute('class', 'draggable-content');
    sampleBox.setAttribute('id', 'samplebox' + id);
    sampleBox.setAttribute('sample', sample);
    
    //Color-picker for the samples
    switch(sample) {
        case 'Lead Melody.wav':
            sampleBox.style.backgroundColor = 'ghostwhite';
            break;
        case 'Piano Chords.wav':
            sampleBox.style.backgroundColor = 'black';
            break;
        case 'Synth Chords.wav':
            sampleBox.style.backgroundColor = '#008395';
            break;
        case 'Weird Synth.wav':
            sampleBox.style.backgroundColor = 'pink';
            break;
    }

    /**
     * The 'play' button for specific samplebox
     */
    let playButton = document.createElement('button');
    playButton.textContent = 'Play';
    playButton.setAttribute('data-playbuttonid', id);
    playButton.setAttribute('class', 'sampleButton');
    playButton.setAttribute('id', 'playbutton' + id);

    //Create new audio sample
    let audiosample = './audio/' + sample;
    loadSound(audiosample);
    
    inactiveSamples.appendChild(sampleBox);
    sampleBox.appendChild(playButton);
}

    //https://dl.dropboxusercontent.com/s/6s6rn6rcdlggdzj/Weird%20Synth.wav?dl=0

    function loadSound(audiosample) {
        let request = new XMLHttpRequest();
        request.open('GET', audiosample, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                samples.push(buffer); 
            }, function() {
                console.error('Could not load a sample');
            });
        }
        request.send();
    }

    let sound;
    function playSound(index, checker) {
        sound = context.createBufferSource(); 
		sound.buffer = samples[index]; 
		sound.connect(context.destination);  
		sound.start(0); 
        if(checker) {
            sound.onended = function() {
                let next = parseInt(index) + 1;
                playSound(next);
            }
        }
    }

    function stopSound() {
		sound.stop(0); 
    }

document.addEventListener('click', function(event) {
    let playButton = document.getElementById(event.target.id);
    console.log('samples[]       = ' + samples);
    console.log('activeSamples[] = ' + activeSamples);
    // console.log($(event.target).text());

    /**
     * Play sample
     */
        if(playButton.tagName === 'BUTTON' && playButton.className === 'sampleButton') {
            console.log(playButton.tagName);
            playButton.textContent = 'Play';

            if(playChecker) {
                // playSound(playButton.getAttribute("data-playbuttonid"), false);
                playSound(0);
                playButton.textContent = 'Stop';
                playChecker = false;
            } else {
                playButton.textContent = 'Play';
                playButton.parentNode.style.border = 'solid black';
                stopSound();
                playChecker = true;
            }
        } else if (playButton.tagName === 'BUTTON' && playButton.id === 'play-all-button') {
            if(playChecker) {
                // for(let i = 0; i < samples.length; i++) {
                //     playSound(i);
                // }
                playSound(0, true);
                playButton.parentNode.style.border = 'solid limegreen';
                playButton.textContent = 'Stop all samples';
                playChecker = false;
            } else {
                for(let i = 0; i < activeSamples.length; i++) {
                    sound.stop(0); 
                }
                playButton.parentNode.style.border = 'solid black';
                playButton.textContent = 'Play all samples';
                playChecker = true;
            }
        }    
});

// module.exports = samplebox;
module.exports = {
    makeDroppable: makeDroppable,
    samplebox: samplebox
}