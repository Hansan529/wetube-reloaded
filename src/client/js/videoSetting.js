const like = document.querySelector(".video__likeBtn");
const unrecommended = document.querySelector(".video__unrecommendedBtn");
const shareBtn = document.querySelector(".video__shareBtn");
const shareUrl = document.querySelector(".video__shareWrap-url");
const shareCloseBtn = document.querySelector(".video__shareClose");

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
  [bg, shareCloseBtn].forEach((element) => {
    element.addEventListener("click", () => {
      handleCloseBg(bg);
    });
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
    const copyPopup = document.querySelector(".video__copyUrl");
    copyPopup.classList.add("active");
    setTimeout(() => copyPopup.classList.remove("active"), 1100);
  } catch (error) {
    console.log(error);
  }
};

like.addEventListener("click", handleLike);
shareBtn.addEventListener("click", handleShare);
shareUrl.querySelector(".btn").addEventListener("click", handleShareCopy);
