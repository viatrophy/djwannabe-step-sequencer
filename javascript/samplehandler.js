const audioSamples = require('./audioSamples');

let wrapper = document.querySelector('#wrapper');
let inactiveSamples = document.querySelector('#inactive-samples');
let volumeKnob = document.querySelector('#volumeKnob');
let delayKnob = document.querySelector('#delayKnob');
let recordButton = document.querySelector('#record-button');
let mixerBoard = document.querySelector('#mixer-board');
let looper = document.querySelector('#loop-button');


let samples = audioSamples.audioSamples(); //audiosample paths

let blobCollecter = [];
let preview;

let channel1;  
let channel2;     
let channel3;       
let channel4;       
let channel5;      

let context = new AudioContext();

let gainNode = context.createGain(); //Create a gain node
let analyser = context.createAnalyser(); //Create an analyser node
let audioTime = context.currentTime; //Current time since audioContext declared

let dest = context.createMediaStreamDestination();
let recorder = new MediaRecorder(dest.stream);

gainNode.connect(analyser);
analyser.connect(context.destination);
gainNode.connect(dest);

let freqDomain = new Float32Array(analyser.frequencyBinCount);
analyser.getFloatFrequencyData(freqDomain);

function test() {
    for (let i = 0; i < analyser.frequencyBinCount; i++) {
        console.log('test');
    }
}


function Channel(id) {
    this.id = id;               //Channel id
    this.samples = [];          //channels audiobuffers
    this.sources = [];          //Keep track of buffersource nodes created from scheduler method
    this.timeouts = [];         //setTimeOuts
    this.sampleslotDivs = [];   //Sample-slot id
    this.channelGain = context.createGain();
    this.channelFilter = context.createBiquadFilter();
    this.channelFilter.frequency.value = 20000;

    for (let i = 0; i < 8; i++) {
        let theSlot = document.querySelector('#channel' + this.id + 'Slot' + i);
        this.sampleslotDivs.push(theSlot);
    }

    for (let i = 0; i < 8; i++) {
        loadSound(this, './audio/Silence.ogg');
    }
}

Channel.prototype = {
    addSample: function(sampleSlot, samplePath) {
        loadSound(this, samplePath, sampleSlot);
    },
    scheduler: function(startPoint, i) {            
            let audio = context.createBufferSource();

            this.sources[startPoint] = audio;
            audio.buffer = this.samples[startPoint];

            audio.connect(this.channelFilter);
            this.channelFilter.connect(this.channelGain);
            this.channelGain.connect(gainNode);

            audio.start(context.currentTime + (audio.buffer.duration * i));
            this.timeouts.push(setTimeout(function() {
                // Add the border to the playing sample slot
                let playingSlot = this.sampleslotDivs[startPoint];
                playingSlot.style.boxShadow = '0 0 6px 3px rgba(169, 255, 250, 0.6)';
            }.bind(this), audio.buffer.duration * i * 1000));
            
            audio.onended = function() {
                this.sampleslotDivs[startPoint].style.boxShadow = '';
            }.bind(this);
    },
    stop: function() {
        for (let i = 0; i < 8; i++) {
            if (this.sources[i] !== undefined) {
                this.sources[i].stop(0);
            }
        }

        for (let i = 0; i < this.timeouts.length; i++) {
            clearTimeout(this.timeouts[i]);
        }
    }   
}


function droppableHandler(droppableId, draggableUi, droppableHelper, draggableSampleId, channel) {
    $('#' + droppableId).droppable('enable');       
    if($('#' + droppableId).find('div').length > 0 && $('#' + droppableId).find('div').attr("id") != draggableUi.attr("id")) {
        $('#' + droppableId).find('div').first().remove();
    }
    channel.addSample(droppableHelper, samples[draggableSampleId]);
}

function garbageHandler(droppableHelper, previousSlot, draggableId, channel) {
    channel.addSample(droppableHelper, "./audio/Silence.ogg");
    $('#' + previousSlot).droppable('enable');
    document.querySelector('#' + previousSlot).removeChild(draggableId);
}

$('#garbageCan').droppable({
        drop: function (event, ui) {
            let previousSlot = ui.draggable.attr("previous-slot");
            let droppableHelper = ui.draggable.attr("helper");  
            let draggableHelper = ui.draggable.find("i").attr("data-playbuttonid");
            let draggableId = document.querySelector('#' + ui.draggable.attr("id"));
            if(previousSlot !== undefined) {
                if(previousSlot.includes('channel1Slot')) { garbageHandler(droppableHelper, previousSlot, draggableId, channel1); }
                if(previousSlot.includes('channel2Slot')) { garbageHandler(droppableHelper, previousSlot, draggableId, channel2); }
                if(previousSlot.includes('channel3Slot')) { garbageHandler(droppableHelper, previousSlot, draggableId, channel3); }
                if(previousSlot.includes('channel4Slot')) { garbageHandler(droppableHelper, previousSlot, draggableId, channel4); }
                if(previousSlot.includes('channel5Slot')) { garbageHandler(droppableHelper, previousSlot, draggableId, channel5); }
            } else {
                document.querySelector('#inactive-samples').removeChild(draggableId);
            }     
        }    
});

function droppableDivs() {
    channel1 = new Channel(1, context); 
    channel2 = new Channel(2, context); 
    channel3 = new Channel(3, context); 
    channel4 = new Channel(4, context); 
    channel5 = new Channel(5, context); 

    $('.sample-slot').droppable({
        accept: '.draggable-content',
        drop: function (event, ui) {
            let draggableUi = ui.draggable;
            let draggableHelper = ui.draggable.find("i").attr("data-playbuttonid");    //ta ut samplets index från sample arrayen
            let droppableHelper = $(this).attr("helper");                              //lägg den i index (droppableId) i playlist arrayen
            let droppableId = $(this).attr("id");
            let draggableId = document.querySelector('#' + ui.draggable.attr("id"));
            let draggableSampleId = ui.draggable.attr("sample-id");
            draggableId.setAttribute('previous-slot', droppableId);
            draggableId.setAttribute('helper', droppableHelper);

            if(droppableId.includes('channel1Slot')) { droppableHandler(droppableId, draggableUi, droppableHelper, draggableSampleId, channel1); }   
            if(droppableId.includes('channel2Slot')) { droppableHandler(droppableId, draggableUi, droppableHelper, draggableSampleId, channel2); }   
            if(droppableId.includes('channel3Slot')) { droppableHandler(droppableId, draggableUi, droppableHelper, draggableSampleId, channel3); }      
            if(droppableId.includes('channel4Slot')) { droppableHandler(droppableId, draggableUi, droppableHelper, draggableSampleId, channel4); }    
            if(droppableId.includes('channel5Slot')) { droppableHandler(droppableId, draggableUi, droppableHelper, draggableSampleId, channel5); }   

            $(this).append(ui.draggable);
            ui.draggable.position({of: $(this), my: 'left top', at: 'left top'});
        },
        out: function(event, ui) { 
            let previousSlot = ui.draggable.attr("previous-slot"); 
            let draggableId = document.querySelector('#' + ui.draggable.attr("id"));
            let droppableId = $(this).attr("id");
            
            if(previousSlot !== undefined) {
                let preSlotNum = previousSlot.substr(previousSlot.length - 1);
                if(previousSlot.includes('channel1Slot')) { channel1.addSample(preSlotNum, "./audio/Silence.ogg"); }
                if(previousSlot.includes('channel2Slot')) { channel2.addSample(preSlotNum, "./audio/Silence.ogg"); }
                if(previousSlot.includes('channel3Slot')) { channel3.addSample(preSlotNum, "./audio/Silence.ogg"); }
                if(previousSlot.includes('channel4Slot')) { channel4.addSample(preSlotNum, "./audio/Silence.ogg"); }
                if(previousSlot.includes('channel5Slot')) { channel5.addSample(preSlotNum, "./audio/Silence.ogg"); }
            } else {
                return;
            }
        }
    });
}
            
function loadSound(channel, audiosample, sampleSlot) {
    let request = new XMLHttpRequest();
    request.open('GET', audiosample, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            if (channel !== undefined) {
                if (sampleSlot !== undefined) {
                    channel.samples[sampleSlot] = buffer;
                } else {
                    channel.samples.push(buffer);
                }
            } else {
                //Preview a sample
                preview = context.createBufferSource(); 
                preview.buffer = buffer; 
                preview.connect(context.destination);  
                preview.start(0);
            }
        }, function() {
            console.error('Could not load a sample');
        });
    }
    request.send();
}

function playChannels(counterPoint, playButton) {
    test();
    if(channel1.samples[0] === undefined || channel1.samples[0] === null) {
        return;
    }
    let startPoint = counterPoint;

    if(counterPoint) {
        console.log('startPoint');
        for(let i = 0; i < channel1.samples.length; i++) {
            startPointHandler(startPoint, i);
            startPoint++;
        }
    } else {
        console.log('vanligt');
        for(let i = 0; i < channel1.samples.length; i++) {
            startPointHandler(i, i);
        }
    }
    
    if(channel1.samples[0] === undefined) {
        return;
    } else {
        $('#starting-point').prop('selectedIndex', 0);
        document.querySelector('#play-all-button').style.pointerEvents = 'none';
        $('#starting-point').prop('disabled', true);                                //disable all starting point buttons

        if(playButton) {
            playButton.style.opacity = '';
            playButton.style.color = '#d3e2ed';
            playButton.style.pointerEvents = 'none';                                //prevent spamming multiple layer of sounds by disabling button
            document.querySelector('#stop-all-button').style.opacity = '0.6';
            document.querySelector('#stop-all-button').style.color = '';
        }
    }
}

function startPointHandler(startPoint, i) {
    channel1.scheduler(startPoint, i);
    channel2.scheduler(startPoint, i);
    channel3.scheduler(startPoint, i);
    channel4.scheduler(startPoint, i);
    channel5.scheduler(startPoint, i);
}

function previewSample(index, stopper) {
    if(stopper) {
        preview.stop(0);
    } else {
       loadSound(undefined, samples[index]);
    }
}

function stopAll(playButton) {
    channel1.stop();
    channel2.stop();
    channel3.stop();
    channel4.stop();
    channel5.stop();

    if(playButton) {
        playButton.style.opacity = '';
        playButton.style.color = '#d3e2ed';
        document.querySelector('#play-all-button').style.opacity = '0.6';
        document.querySelector('#play-all-button').style.color = '';
        document.querySelector('#play-all-button').style.pointerEvents = '';
    }
}

function muteChannel(id) {
    if(id == 1) { channel1.channelGain.gain.value = 0; }
    if(id == 2) { channel2.channelGain.gain.value = 0; }    
    if(id == 3) { channel3.channelGain.gain.value = 0; }
    if(id == 4) { channel4.channelGain.gain.value = 0; }
    if(id == 5) { channel5.channelGain.gain.value = 0; }
}

function unmuteChannel(id) {
    if(id == 1) { channel1.channelGain.gain.value = 1; }
    if(id == 2) { channel2.channelGain.gain.value = 1; }    
    if(id == 3) { channel3.channelGain.gain.value = 1; }
    if(id == 4) { channel4.channelGain.gain.value = 1; }
    if(id == 5) { channel5.channelGain.gain.value = 1; }
}

function audioRecorder(recording) {
    if(recording) {
        gotStream(recorder.start());
        recordButton.style.opacity = '1';
    } else {
        recorder.stop();
        recordButton.style.opacity = '';
    }

    recorder.ondataavailable = function(event) {
        blobCollecter.push(event.data);
    };

    recorder.onstop = function(event) {
        let chromeChecker = MediaRecorder.isTypeSupported('audio/webm;codecs=opus');
        let firefoxChecker = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus'); 
        let blob;
        if(chromeChecker) {
            return alert('Chrome är cp. Om du vill ladda ner låten så använd Firefox.');
        } 
        if(firefoxChecker) {
            blob = new Blob(blobCollecter, { 'type' : 'audio/ogg; codecs=opus' });
        }
        
        let url = URL.createObjectURL(blob);
        let a = document.querySelector("#audio-recorder");
        a.style = 'display: none';
        a.href = url;
        a.download = 'djwannabe_track.ogg';
        a.click();
        window.URL.revokeObjectURL(url);
    };
}

mixerBoard.addEventListener('input', function(event) {
    if(event.target.className === 'mixer-volume') {
        switch(event.target.id) {
            case 'mixVolume1': channel1.channelGain.gain.value = event.target.value / 100;
                break;
            case 'mixVolume2': channel2.channelGain.gain.value = event.target.value / 100;
                break;
            case 'mixVolume3': channel3.channelGain.gain.value = event.target.value / 100;
                break;
            case 'mixVolume4': channel4.channelGain.gain.value = event.target.value / 100;
                break;
            case 'mixVolume5': channel5.channelGain.gain.value = event.target.value / 100;
                break;
        }
    }
    if(event.target.className === 'mixer-filter') {
        let filterFrequency = 20000 / event.target.value;
        if(filterFrequency > 20000) {
            filterFrequency = 20000;
        }
        console.log(filterFrequency);
        switch(event.target.id) {
            case 'lowpassFilter1': channel1.channelFilter.frequency.value = filterFrequency;
                break;
            case 'lowpassFilter2': channel2.channelFilter.value = filterFrequency;
                break;
            case 'lowpassFilter3': channel3.channelFilter.value = filterFrequency;
                break;
            case 'lowpassFilter4': channel4.channelFilter.value = filterFrequency;
                break;
            case 'lowpassFilter5': channel5.channelFilter.value = filterFrequency;
                break;
        }
    }
})

volumeKnob.addEventListener('input', function() {
    let volume = volumeKnob.value / 100;
    let volumeUp = document.querySelector('#volume-icon-up');
    let volumeDown = document.querySelector('#volume-icon-down');
    gainNode.gain.value = volume;

    if(volume < 0.5) {
        volumeDown.style.color = 'ghostwhite';
        volumeUp.style.color = '#8FB3CD';
    } else {
        volumeDown.style.color = '#8FB3CD';
        volumeUp.style.color = 'ghostwhite';
    }
    console.log('Volume: ' + (Math.round(gainNode.gain.value * 100)) + '%');
})

module.exports = {
    playChannels: playChannels,
    previewSample: previewSample, 
    stopAll: stopAll,
    muteChannel: muteChannel,
    unmuteChannel: unmuteChannel,
    audioRecorder: audioRecorder,
    droppableDivs: droppableDivs,
};