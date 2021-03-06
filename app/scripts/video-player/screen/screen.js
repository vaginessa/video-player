(function() {
    'use strict';

    if (!window.VideoPlayerController) window.VideoPlayerController = {};

    window.VideoPlayerController.Screen = function(element) {
        //public
        this.destroy = destroy;
        this.setVideo = setVideo;
        this.startVideo = startVideo;
        this.pauseVideo = pauseVideo;
        this.stopVideo = stopVideo;
        this.getState = getState;
        //and Observable methods

        //private
        var that = this;
        var state = 'STOPPED';
        var videoElement = null;
        var videoControls = null; //it could be another object
        var forceToPlay = false;
        var fullscreen = new VideoPlayerUtils.FullScreen();

        constructor();

        ///implementation
        function constructor() {
            //test if player is not already initialized on this node
            if (element.className.indexOf('vplayer-screen') !== -1) {
                element = null;
                return;
            } else {
                element.className = element.className + ' vplayer-screen';
            }

            setStateClass(state);
            draw();
            videoElement = element.querySelector('video');
            videoControls = new VideoPlayerController.VideoControls(element.querySelector('div'), videoElement.volume);

            bind();
        }

        function draw() {
            element.innerHTML = '<video></video><img src="/images/placeholder.jpg"/><div></div>';
        }

        function bind() {
            videoControls.onPress('[data-action=play]', startVideo.bind(that));
            videoControls.onPress('[data-action=pause]', pauseVideo.bind(that));
            videoControls.onPress('[data-action=stop]', stopVideo.bind(that));
            videoControls.onPress('[data-action=fullscreen]', onFullscreen.bind(that));
            videoControls.onVolumeChange(onVolumeChange.bind(that));

            videoElement.addEventListener('playing', onVideoStateChanged.bind(that));
            videoElement.addEventListener('pause', onVideoStateChanged.bind(that));
            videoElement.addEventListener('ended', onVideoStateChanged.bind(that));
            that.on('state-changed', setStateClass.bind(that));
        }

        function onVideoStateChanged(e) {
            if (e.type === 'playing') {
                state = 'PLAYING';
            } else if (e.type === 'pause') {
                state = 'PAUSED';
            } else if (e.type === 'ended') {
                state = 'ENDED';
            }
            that.notify('state-changed', state);
        }

        function stopVideo() {
            pauseVideo();
            videoElement.innerHTML = '';
            state = 'STOPPED';
            that.notify('state-changed', state);
        }

        function setStateClass(state) {
            element.className = 'vplayer-screen vplayer-screen--' + state;
        }

        function getState() {
            return state;
        }

        function onVolumeChange(a, b, slides) {
            videoElement.volume = slides;
        }

        function setVideo(movie) {
            if (!movie) return;

            if (Array.isArray(movie.urls)) {
                videoElement.innerHTML = '';
                for (var i in movie.urls) {
                    var newVideo = document.createElement('source');
                    newVideo.src = movie.urls[i];
                    newVideo.type = 'video/' + movie.urls[i].split('.').reverse()[0];
                    videoElement.appendChild(newVideo);
                }
            }

            videoElement.load();

            if (forceToPlay) {
                startVideo();
            }
        }

        function startVideo() {
            forceToPlay = true;
            if (videoElement.childNodes.length !== 0) {
                videoElement.play();
            } else {
                that.notify('no-movie')
            }
        }

        function pauseVideo() {
            forceToPlay = false;
            videoElement.pause();
        }

        function onFullscreen() {
            if (fullscreen.isFullScreenAvailable()) {
                if (fullscreen.isFullScreen()) {
                    fullscreen.exitFullScreen();
                } else {
                    fullscreen.goFullScreen(element);
                }
            }
        }

        function destroy() {
            if (videoControls) {
                videoControls.destroy();
            }
            if (element) {
                element.innerHTML = '';
                element.className = '';
            }
        }
    }

    window.VideoPlayerController.Screen.prototype = new VideoPlayerUtils.Observable();

})();
