const mediaQueryLarge = "(min-width: 1201px)";
const mediaQueryTablet = "(min-width: 768px) and (max-width: 1200px)";
const mediaQueryMobile = "(min-width: 481px) and (max-width: 767px)";
const mediaQuerySmall = "(max-width: 480px)";

const headerUploadBtn = document.querySelector(".header__uploadBtn");
const headerEditBtn = document.querySelector(".header__editBtn");
const headerLogoutBtn = document.querySelector(".header__logoutBtn");

const handleResize = () => {
  // * 1201px 이상
  if (window.matchMedia(mediaQueryLarge).matches) {
    return;
  }

  // * 1200px 이하
  if (window.matchMedia(mediaQueryTablet).matches) {
    return;
  }

  // * 768px 이하
  if (window.matchMedia(mediaQueryMobile).matches) {
    headerUploadBtn.innerText = "동영상 업로드";
    headerLogoutBtn.innerText = "로그아웃";
    return;
  }

  // * 480px 이하
  if (window.matchMedia(mediaQuerySmall).matches) {
    headerUploadBtn.innerHTML = "<i></i>";
    headerUploadBtn.querySelector("i").className = "fa-solid fa-upload";
    headerLogoutBtn.innerHTML = "<i></i>";
    headerLogoutBtn.querySelector("i").className =
      "fa-solid fa-arrow-right-from-bracket";
    return;
  }
};

handleResize();

let resizeTimeout;

const throttleResize = () => {
  if (resizeTimeout) {
    cancelAnimationFrame(resizeTimeout);
  }

  resizeTimeout = requestAnimationFrame(() => {
    handleResize();
    resizeTimeout = null;
  });
  console.log("resizeTimeout: ", resizeTimeout);
};

window.addEventListener("resize", throttleResize);
