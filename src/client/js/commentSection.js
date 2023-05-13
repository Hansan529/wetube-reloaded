const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".video__comment-delete");
const videoId = videoContainer.dataset.id;
const videoComments = document.querySelector(".video__comments ul");

const addComment = async (text) => {
  const newComment = document.createElement("li");
  newComment.className = "video__comment";

  const span = document.createElement("span");
  span.className = "video__comment-text";
  span.innerText = text.trim();

  const img = document.createElement("img");
  img.className = "video__comment-owner";
  const response = await fetch(`/api/videos/${videoId}/profile`, {
    method: "POST",
  });
  const data = await response.json();
  const avatarUrl = data.avatarUrls[data.avatarUrls.length - 1];
  const socialLogin = data.socialLogin;

  const deleteBtn = document.createElement("span");
  deleteBtn.className = "video__comment-delete";
  deleteBtn.innerText = "❌";
  deleteBtn.addEventListener("click", removeComment);

  if (!avatarUrl) {
    const imgSpan = document.createElement("span");
    imgSpan.className = "video__comment-owner";
    imgSpan.innerText = "😀";
    newComment.appendChild(imgSpan);
  } else {
    socialLogin ? (img.src = avatarUrl) : (img.src = `/${avatarUrl}`);
    socialLogin ? (img.crossOrigin = "anonymous") : (img.crossOrigin = null);
    newComment.appendChild(img);
  }

  newComment.appendChild(span);
  newComment.appendChild(deleteBtn);
  videoComments.prepend(newComment);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value.trim();
  if (text.trim() === "") {
    return;
  }
  const { status } = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
    credentials: "same-origin",
  });
  if (status === 201) {
    addComment(text);
  }
  textarea.value = "";
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const removeComment = async (e) => {
  const target = e.currentTarget;
  const li = target.closest(".video__comment");
  const index = Array.prototype.indexOf.call(videoComments.children, li);

  await fetch(`/api/videos/${videoId}/comment-delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index }),
  });

  const deleteLi = videoComments.children[index];
  videoComments.removeChild(deleteLi);
};

deleteBtn.forEach((btn) => {
  btn.addEventListener("click", removeComment);
});
