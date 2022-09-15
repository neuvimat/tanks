const VideoControls = {
    init() {
        let videos = document.querySelectorAll('.video-holder');
        for (let v of videos) {
            let video = v.querySelector('video');
            let play = v.querySelector('.play');
            let seek = v.querySelector('.seek input');
            let volume = v.querySelector('.volume');
            let volumeRange = v.querySelector('.volume-range input');
            let fullscreen = v.querySelector('.fullscreen');

            volumeRange.value = video.volume;
            seek.value = video.currentTime / video.duration;

            $(video).click((e)=>{
                if (video.paused) {
                    $(play).attr('data-playing', 'true');
                    video.play();
                }
                else {
                    $(play).attr('data-playing', 'false');
                    video.pause();
                }
            });
            $(play).click((e)=>{
                if (video.paused) {
                    $(play).attr('data-playing', 'true');
                    video.play();
                }
                else {
                    $(play).attr('data-playing', 'false');
                    video.pause();
                }
            });

            $(seek).on('input', (e)=>{
                video.currentTime = video.duration * e.target.value;
            });

            $(volume).on('click', (e)=>{
                video.muted = !video.muted;
                if (video.muted === true) {
                    $(volume).attr('data-muted','true')
                }
                else {
                    $(volume).attr('data-muted','false')
                }
            });

            $(volumeRange).on('input', (e)=>{
                if (e.target.value === "0") {
                    $(volume).attr('data-muted','true')
                }
                else {
                    $(volume).attr('data-muted', 'false');
                    video.muted = false;
                }
                video.volume = e.target.value;
            });

            $(fullscreen).on('click', (e)=>{
                console.log('request fullscreen');
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.mozRequestFullScreen) { /* Firefox */
                    video.mozRequestFullScreen();
                } else if (video.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                    video.webkitRequestFullscreen();
                } else if (video.msRequestFullscreen) { /* IE/Edge */
                    video.msRequestFullscreen();
                }
            });

            // No need for the callback below since we are hooked to all ways of changing the volume (by UI), hence it is commented out
            // $(video).on('volumechange', (e)=>{
            //
            // });

            $(video).on('timeupdate', (e)=>{
                seek.value = video.currentTime / video.duration;
            });

            $(video).on('ended', (e)=>{
                // Do we want to do anything, actually?
            });
        }
    }
};

module.exports = VideoControls;