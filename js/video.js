document.addEventListener('DOMContentLoaded', () => {
    const videoTriggers = document.querySelectorAll('.video-trigger');
    const videoModal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    const videoClose = videoModal?.querySelector('.video-close');
    const videoOverlay = videoModal?.querySelector('.modal__overlay');

    if (!videoModal || !videoFrame) return;

    function closeVideoModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
        }

        if (videoFrame) {
            const currentSrc = videoFrame.src;
            videoFrame.src = '';
            videoFrame.src = currentSrc;
            setTimeout(() => {
                videoFrame.src = '';
            }, 100);
        }

        document.body.style.overflow = '';
    }

    function openVideoModal(videoUrl) {
        if (!videoUrl) return;

        const embedUrl = getEmbedUrl(videoUrl);

        if (videoFrame) {
            videoFrame.src = embedUrl;
        }

        if (videoModal) {
            videoModal.classList.add('active');
        }

        document.body.style.overflow = 'hidden';
    }

    function getEmbedUrl(url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = extractYouTubeId(url);
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
        }

        if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
        }

        return url;
    }

    function extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }

    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const videoUrl = trigger.dataset.video;
            openVideoModal(videoUrl);
        });
    });

    if (videoClose) {
        videoClose.addEventListener('click', closeVideoModal);
    }

    if (videoOverlay) {
        videoOverlay.addEventListener('click', closeVideoModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal || e.target === videoOverlay) {
                closeVideoModal();
            }
        });
    }
});
