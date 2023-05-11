const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const videoId = videoContainer.dataset.id;

const addComment = async (text) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";

  const img = document.createElement("img");
  img.className = "video__comment-owner";
  const response = await fetch(`/api/videos/${videoId}/profile`, {
    method: "POST",
  });
  const data = await response.json();
  const avatarUrl = data.avatarUrls[data.avatarUrls.length - 1];
  img.src = avatarUrl;
  img.crossOrigin = "anonymous";

  const span = document.createElement("span");
  span.innerText = text;

  newComment.appendChild(img);
  newComment.appendChild(span);
  videoComments.prepend(newComment);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
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

// TODO: 코멘트 삭제
