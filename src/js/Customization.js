const SoundBank = require('./game/SoundBank');

$(window).on('load', () => {
    let here = $('#drop-here');
    let hereDummy = $('#drop-here-dummy');
    let reset = $('#drop-reset button');
    let info = $('#drop-info div');


    // Stuff does not work without this
    here[0].addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    let counter = 0; // Required to properly add and remove CSS class as the event is fired for both the wrapper and the inside div that has transforms on it
    here[0].addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();

        counter++;
        hereDummy.addClass('pulse');
    }, true);

    here[0].addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();

        counter--;
        if (counter === 0) {
            hereDummy.removeClass('pulse');
        }
    }, true);

    // for whatever reason jQuerry.on() was causing some issues
    here[0].addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        hereDummy.removeClass('pulse');
        counter = 0;
        if (e.dataTransfer.files.length > 0) // Is it even possible for this if ever to be false?
        {
            // We care only about the first file in case some doofus uploaded more than one
            if (e.dataTransfer.files[0].type.indexOf('audio') !== -1) {
                // The much better way:
                let url = URL.createObjectURL(e.dataTransfer.files[0]);
                let file = e.dataTransfer.files[0];
                info.html(`Filename: ${file.name}<br/><audio src='${url}' controls="controls">`);

                // The file reader way for the third API
                let fr = new FileReader();
                fr.addEventListener('load', (ev) => {
                    info.html(`Filename: ${file.name}<br/><audio src='${ev.target.result}' controls="controls">`);
                    SoundBank.instance.sounds.shot.src = ev.target.result;
                });
                fr.readAsDataURL(e.dataTransfer.files[0]);
            }
            else {
                SoundBank.instance.sounds.shot.src = 'sfx/shot.wav';
                info.html('File was not recognized as an audio file! The default sound will be used instead.');
                alert('The file was not recognized as an audio file! Try again.');
            }
        }
    });

    reset.click((e)=>{
        SoundBank.instance.sounds.shot.src = 'sfx/shot.wav';
        info.html('');
    });
});