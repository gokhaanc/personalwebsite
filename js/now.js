(() => {
  "use strict";

  const clock = document.querySelector("[data-clock]");
  const year = document.querySelector("[data-year]");
  const copyButton = document.querySelector("[data-copy-email]");
  const copyLabel = document.querySelector("[data-copy-label]");
  const copyHint = document.querySelector("[data-copy-hint]");
  const copyIcon = document.querySelector("[data-copy-icon]");
  const checkIcon = document.querySelector("[data-check-icon]");
  const copyLive = document.querySelector("[data-copy-live]");
  const istanbulTime = document.querySelector("[data-istanbul-time]");
  const loopVideos = Array.from(document.querySelectorAll("[data-loop-video]"));
  const youtubeBackground = document.querySelector("[data-youtube-background]");
  const musicCard = document.querySelector("[data-music-card]");
  const musicPlayer = document.querySelector("[data-music-player]");
  const musicToggle = document.querySelector("[data-music-toggle]");
  const musicPlayIcon = document.querySelector("[data-music-play-icon]");
  const musicPauseIcon = document.querySelector("[data-music-pause-icon]");
  const musicLive = document.querySelector("[data-music-live]");
  const locationGlobe = document.querySelector("[data-location-globe]");
  const lightboxTriggers = Array.from(document.querySelectorAll("[data-lightbox-trigger]"));
  const photoLightbox = document.querySelector("[data-photo-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const lightboxClose = document.querySelector("[data-lightbox-close]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit"
  });

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const istanbulTimeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  function updateClock() {
    const now = new Date();

    if (clock) {
      const date = dateFormatter.format(now).replace(/,/g, "");
      const time = timeFormatter.format(now);
      clock.textContent = `${date} · ${time}`.toUpperCase();
      clock.dateTime = now.toISOString();
    }

    if (istanbulTime) {
      istanbulTime.textContent = `UTC+3 · ${istanbulTimeFormatter.format(now)}`;
    }

    window.setTimeout(updateClock, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()));
  }

  function initializeTooltips() {
    document.querySelectorAll(".social-link").forEach((link, index) => {
      const tooltip = link.querySelector("[role='tooltip']");
      if (!tooltip) return;

      const tooltipId = `social-tooltip-${index + 1}`;
      tooltip.id = tooltipId;
      tooltip.setAttribute("aria-hidden", "true");
      link.setAttribute("aria-describedby", tooltipId);

      const show = () => tooltip.setAttribute("aria-hidden", "false");
      const hide = () => tooltip.setAttribute("aria-hidden", "true");
      link.addEventListener("pointerenter", show);
      link.addEventListener("pointerleave", hide);
      link.addEventListener("focus", show);
      link.addEventListener("blur", hide);
    });
  }

  function playMedia(media) {
    const playPromise = media.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function synchronizeLoopVideo(video) {
    const shouldPlay = video.dataset.inView === "true" && !document.hidden && !reducedMotion.matches;
    if (shouldPlay) {
      playMedia(video);
    } else {
      video.pause();
    }
  }

  function initializeLoopVideos() {
    if (!loopVideos.length) return;

    loopVideos.forEach((video) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("loop", "");
      video.dataset.inView = "false";

      video.addEventListener("ended", () => {
        video.currentTime = 0;
        synchronizeLoopVideo(video);
      });

      video.addEventListener("timeupdate", () => {
        const remaining = video.duration - video.currentTime;
        if (!Number.isFinite(remaining) || remaining <= 0 || remaining > 0.35 || video.dataset.rewinding === "true") return;

        video.dataset.rewinding = "true";
        video.currentTime = 0;
        synchronizeLoopVideo(video);
        window.requestAnimationFrame(() => delete video.dataset.rewinding);
      });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          video.dataset.inView = entry.isIntersecting && entry.intersectionRatio >= 0.18 ? "true" : "false";
          synchronizeLoopVideo(video);
        });
      }, { threshold: [0, 0.18, 0.5] });

      loopVideos.forEach((video) => observer.observe(video));
    } else {
      loopVideos.forEach((video) => {
        video.dataset.inView = "true";
        synchronizeLoopVideo(video);
      });
    }
  }

  function sendYoutubeCommand(frame, command) {
    if (!frame || !frame.contentWindow || !frame.src) return;

    frame.contentWindow.postMessage(JSON.stringify({
      event: "command",
      func: command,
      args: []
    }), "*");
  }

  let youtubeBackgroundFrame;
  let youtubeBackgroundLoaded = false;
  let youtubeBackgroundInView = false;
  let youtubeBackgroundRevealTimer;

  function scheduleYoutubeBackgroundReveal(delay = 6200) {
    if (!youtubeBackground) return;

    window.clearTimeout(youtubeBackgroundRevealTimer);
    youtubeBackground.classList.remove("is-ready");
    if (reducedMotion.matches || !youtubeBackgroundLoaded) return;

    youtubeBackgroundRevealTimer = window.setTimeout(() => {
      if (!reducedMotion.matches && youtubeBackgroundLoaded) {
        youtubeBackground.classList.add("is-ready");
      }
    }, delay);
  }

  function synchronizeYoutubeBackground() {
    if (!youtubeBackground || !youtubeBackgroundFrame) return;

    const shouldPlay = youtubeBackgroundInView && !document.hidden && !reducedMotion.matches;
    if (shouldPlay && !youtubeBackgroundLoaded) {
      youtubeBackgroundFrame.src = youtubeBackground.dataset.src;
      youtubeBackgroundLoaded = true;
      return;
    }

    if (youtubeBackgroundLoaded) {
      sendYoutubeCommand(youtubeBackgroundFrame, shouldPlay ? "playVideo" : "pauseVideo");
    }
  }

  function initializeYoutubeBackground() {
    if (!youtubeBackground) return;
    youtubeBackgroundFrame = youtubeBackground.querySelector("iframe");
    if (!youtubeBackgroundFrame) return;

    youtubeBackgroundFrame.addEventListener("load", () => {
      synchronizeYoutubeBackground();
      scheduleYoutubeBackgroundReveal();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          youtubeBackgroundInView = entry.isIntersecting && entry.intersectionRatio >= 0.18;
          synchronizeYoutubeBackground();
        });
      }, { threshold: [0, 0.18, 0.5] });
      observer.observe(youtubeBackground);
    } else {
      youtubeBackgroundInView = true;
      synchronizeYoutubeBackground();
    }

    window.addEventListener("message", (event) => {
      if (!youtubeBackgroundFrame || event.source !== youtubeBackgroundFrame.contentWindow) return;

      let message = event.data;
      if (typeof message === "string") {
        try {
          message = JSON.parse(message);
        } catch (_error) {
          return;
        }
      }

      if (message?.event === "onStateChange" && message.info === 0 && youtubeBackgroundInView) {
        sendYoutubeCommand(youtubeBackgroundFrame, "playVideo");
      }
    });
  }

  let musicLoaded = false;
  let musicPlaying = false;
  let musicStartedByHover = false;

  function updateMusicState(playing, announcement = "") {
    if (!musicToggle || !musicPlayIcon || !musicPauseIcon) return;

    musicPlaying = playing;
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", `${playing ? "Pause" : "Play"} Lady Hear Me Tonight`);
    musicPlayIcon.classList.toggle("is-visible", !playing);
    musicPauseIcon.classList.toggle("is-visible", playing);
    if (musicCard) musicCard.classList.toggle("is-playing", playing);
    if (musicLive) musicLive.textContent = announcement;
  }

  function initializeMusicPlayer() {
    if (!musicPlayer || !musicToggle || !musicCard) return;

    const setMusicPlayback = (playing, announcement) => {
      if (playing && !musicLoaded) {
        musicPlayer.src = musicPlayer.dataset.src;
        musicLoaded = true;
      } else if (musicLoaded) {
        sendYoutubeCommand(musicPlayer, playing ? "playVideo" : "pauseVideo");
      }

      updateMusicState(playing, announcement);
    };

    musicPlayer.addEventListener("load", () => {
      sendYoutubeCommand(musicPlayer, musicPlaying ? "playVideo" : "pauseVideo");
    });

    musicToggle.addEventListener("click", () => {
      const nextState = !musicPlaying;
      musicStartedByHover = false;
      setMusicPlayback(nextState, `${nextState ? "Playing" : "Paused"} Lady Hear Me Tonight.`);
    });

    musicCard.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch" || musicPlaying) return;
      musicStartedByHover = true;
      setMusicPlayback(true, "Playing Lady Hear Me Tonight by Com211.");
    });

    musicCard.addEventListener("pointerleave", () => {
      if (!musicStartedByHover) return;
      musicStartedByHover = false;
      setMusicPlayback(false, "Paused Lady Hear Me Tonight.");
    });
  }

  let globeAnimationFrame;
  let lastGlobeFrame = 0;

  function encodeBraille(value) {
    return (value & 0x08) << 3 | (value & 0x70) >> 1 | (value & 0x87) | 0x2800;
  }

  function renderLocationGlobe(time = 0) {
    if (!locationGlobe) return;

    const width = 48;
    const height = 56;
    const rows = Array.from({ length: height >> 2 }, () => new Uint8Array(width >> 1));
    const rotation = time * 0.32;

    const setDot = (x, y) => {
      rows[y >> 2][x >> 1] |= 1 << ((y & 3) | (x & 1) << 2);
    };

    for (let y = 0; y < height; y += 1) {
      const v = 2 * y / (height - 1) - 1;

      for (let x = 0; x < width; x += 1) {
        const u = 2 * x / (width - 1) - 1;
        const distance = u * u + v * v;
        if (distance > 1) continue;

        const z = Math.sqrt(1 - distance);
        const longitude = Math.atan2(u, z) + rotation;
        const latitude = Math.asin(Math.max(-1, Math.min(1, v)));
        const terrain =
          0.42 * Math.sin(longitude * 2.15 + Math.sin(latitude * 3.1)) +
          0.26 * Math.sin(longitude * 5.2 - latitude * 4.4) +
          0.18 * Math.cos(longitude * 9.1 + latitude * 6.8) +
          0.12 * Math.sin((longitude + latitude) * 13.3);
        const isLand = terrain + 0.12 * Math.cos(latitude * 2) > 0.16;
        const light = Math.max(0.18, Math.min(1, 0.42 + 0.58 * z - 0.18 * u));
        const stipple = ((x * 13 + y * 7) % 19) / 19;
        const density = isLand ? 0.32 + 0.62 * light : distance > 0.88 ? 0.34 : 0.045;

        if (stipple < density) setDot(x, y);
      }
    }

    locationGlobe.textContent = rows
      .map((row) => String.fromCharCode(...Array.from(row, encodeBraille)))
      .join("\n");
  }

  function synchronizeLocationGlobe() {
    if (!locationGlobe) return;

    window.cancelAnimationFrame(globeAnimationFrame);
    renderLocationGlobe(0);
    if (reducedMotion.matches) return;

    const animate = (timestamp) => {
      if (timestamp - lastGlobeFrame >= 90) {
        renderLocationGlobe(timestamp / 1000);
        lastGlobeFrame = timestamp;
      }
      globeAnimationFrame = window.requestAnimationFrame(animate);
    };

    globeAnimationFrame = window.requestAnimationFrame(animate);
  }

  let lastLightboxTrigger;
  let lightboxCloseTimer;

  function initializePhotoLightbox() {
    if (!photoLightbox || !lightboxImage || !lightboxCaption || !lightboxClose || !lightboxTriggers.length) return;

    const closeLightbox = () => {
      if (photoLightbox.hidden) return;

      window.clearTimeout(lightboxCloseTimer);
      photoLightbox.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");

      lightboxCloseTimer = window.setTimeout(() => {
        photoLightbox.hidden = true;
        lightboxImage.removeAttribute("src");
        lightboxImage.alt = "";
        lightboxCaption.textContent = "";
        if (lastLightboxTrigger) lastLightboxTrigger.focus({ preventScroll: true });
      }, reducedMotion.matches ? 0 : 220);
    };

    lightboxTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const image = trigger.querySelector("img");
        if (!image) return;

        window.clearTimeout(lightboxCloseTimer);
        lastLightboxTrigger = trigger;
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = image.alt;
        photoLightbox.hidden = false;
        document.body.classList.add("lightbox-open");

        window.requestAnimationFrame(() => {
          photoLightbox.classList.add("is-open");
          lightboxClose.focus({ preventScroll: true });
        });
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !photoLightbox.hidden) closeLightbox();
    });
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.inset = "0 auto auto -9999px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      textArea.remove();
    }

    if (!copied) throw new Error("Copy command was unavailable");
  }

  let resetCopyState;

  function setCopyState({ label, hint, message, copied }) {
    if (!copyButton || !copyLabel || !copyHint || !copyIcon || !checkIcon || !copyLive) return;

    copyLabel.textContent = label;
    copyHint.textContent = hint;
    copyLive.textContent = message;
    copyIcon.classList.toggle("is-visible", !copied);
    checkIcon.classList.toggle("is-visible", copied);
    copyButton.setAttribute("aria-label", copied ? "Email copied to clipboard" : "Copy hi@gokhan.pw to clipboard");
  }

  async function copyEmail() {
    if (!copyButton) return;

    const email = copyButton.dataset.copyEmail;
    window.clearTimeout(resetCopyState);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        fallbackCopy(email);
      }

      setCopyState({
        label: "Copied email",
        hint: "To clipboard",
        message: `${email} copied to clipboard.`,
        copied: true
      });
    } catch (_error) {
      setCopyState({
        label: email,
        hint: "Copy unavailable",
        message: `Could not copy ${email}.`,
        copied: false
      });
    }

    resetCopyState = window.setTimeout(() => {
      setCopyState({
        label: email,
        hint: "Copy email",
        message: "",
        copied: false
      });
    }, 1800);
  }

  if (year) year.textContent = String(new Date().getFullYear());
  if (copyButton) {
    copyButton.setAttribute("aria-label", "Copy hi@gokhan.pw to clipboard");
    copyButton.addEventListener("click", copyEmail);
  }

  document.addEventListener("visibilitychange", () => {
    loopVideos.forEach(synchronizeLoopVideo);
    synchronizeYoutubeBackground();

    if (document.hidden && musicPlaying) {
      musicStartedByHover = false;
      sendYoutubeCommand(musicPlayer, "pauseVideo");
      updateMusicState(false, "Paused Lady Hear Me Tonight.");
    }
  });

  const handleMotionPreferenceChange = () => {
    loopVideos.forEach(synchronizeLoopVideo);
    synchronizeYoutubeBackground();
    scheduleYoutubeBackgroundReveal();
    synchronizeLocationGlobe();
  };

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof reducedMotion.addListener === "function") {
    reducedMotion.addListener(handleMotionPreferenceChange);
  }

  initializeTooltips();
  initializeLoopVideos();
  initializeYoutubeBackground();
  initializeMusicPlayer();
  synchronizeLocationGlobe();
  initializePhotoLightbox();
  updateClock();
})();
