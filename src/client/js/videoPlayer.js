const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const form = document.getElementById("commentForm");
const like = document.querySelector(".video__likeBtn");
const unrecommended = document.querySelector(".video__unrecommendedBtn");
const shareBtn = document.querySelector(".video__shareBtn");
const shareUrl = document.querySelector(".video__shareWrap-url");

let volumeValue = 1;
video.volume = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  return (playBtnIcon.classList = video.paused
    ? "fas fa-play"
    : "fas fa-pause");
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  return (volumeRange.value = video.muted ? 0 : volumeValue);
};

const handleVolumeChange = (e) => {
  const {
    target: { value },
  } = e;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  }
  volumeValue = value;
  return (video.volume = value);
};

const formatTime = (seconds) => {
  if (seconds >= 3600) {
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  } else {
    return new Date(seconds * 1000).toISOString().substring(14, 19);
  }
};

const handleLoadedMetadata = () => {
  timeline.max = Math.floor(video.duration);
  totalTime.innerText = formatTime(Math.floor(video.duration));
  return;
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
  return;
};

const handleTimelineChange = (e) => {
  const {
    target: { value },
  } = e;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
  fullScreenBtn.classList = fullscreen ? "fas fa-" : "Exit Full Screen";
};

let controlsMovementTimeout = null;

const hideControls = () => videoControls.classList.remove("showing");
const timeoutCancle = () => {
  clearTimeout(controlsMovementTimeout);
  controlsMovementTimeout = null;
};

const handleMouseMove = () => {
  if (controlsMovementTimeout) {
    timeoutCancle();
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  timeoutCancle();
  hideControls();
};

const ArrowLeft = () => {
  let { currentTime } = video;
  currentTime = currentTime < 1 ? 0 : currentTime - 1;
  video.currentTime = currentTime;
};
const ArrowRight = () => {
  let { currentTime } = video;
  currentTime =
    currentTime > video.max ? video.max : Math.floor(currentTime + 1);
  video.currentTime = currentTime;
};
const KeyM = () => {
  handleMute();
};
const KeyF = () => {
  handleFullScreen();
};

const keyFunctions = {
  Space: handlePlayClick,
  ArrowLeft,
  ArrowRight,
  KeyM,
  KeyF,
};

const handleKeydown = (e) => {
  if (!"TEXTAREA".includes(e.target.tagName)) {
    const keyFunction = keyFunctions[e.code];
    if (keyFunction) {
      keyFunction();
    }
    return;
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

// * 좋아요 기능 API 요청
const handleLike = async () => {
  const { id } = videoContainer.dataset;
  const response = await fetch(`/api/videos/${id}/like`, {
    method: "POST",
  });
  const data = await response.json();
  if (response.status === 500) {
    const login = document.querySelector(".loginBtn");
    login.click();
    return;
  }
  const likeCheck = data.likeCheck;
  const likeCount = data.likes;
  if (likeCheck) {
    like.className = "video__likeBtn fa-regular fa-thumbs-up";
    like.innerText = likeCount - 1;
  } else {
    like.className = "video__likeBtn fa-solid fa-thumbs-up";
    like.innerText = likeCount + 1;
  }
};

// * 공유 http 경로 설정
const url = document.querySelector(".video__shareWrap-url input");
const currentPath = window.location.href;
url.value = currentPath;

// * 공유하기 on/off
const handleShare = () => {
  const bg = document.querySelector(".video__shareWrap");
  const share = document.querySelector(".video__share");
  bg.classList.remove("none");
  bg.addEventListener("click", () => {
    handleCloseBg(bg);
  });
  share.addEventListener("click", (e) => {
    e.stopPropagation();
  });
};
const handleCloseBg = (bg) => {
  bg.classList.add("none");
};

// * 공유 링크 복사
const handleShareCopy = async () => {
  const url = shareUrl.querySelector("input").value;
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    console.log(error);
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown", handleKeydown);
like.addEventListener("click", handleLike);
shareBtn.addEventListener("click", handleShare);
shareUrl.querySelector(".btn").addEventListener("click", handleShareCopy);
