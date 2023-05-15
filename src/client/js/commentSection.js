const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const editBtn = document.querySelectorAll(".video__comment-edit");
const deleteBtn = document.querySelectorAll(".video__comment-delete");
const videoId = videoContainer.dataset.id;
const videoComments = document.querySelector(".video__comments ul");

let commentText;

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

  const editBtn = document.createElement("button");
  editBtn.className = "video__comment-edit fa-solid fa-pen-to-square";
  editBtn.addEventListener("click", editComment);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "video__comment-delete fa-solid fa-trash-can";
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
  newComment.appendChild(editBtn);
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

const editComment = (e) => {
  const exists = document.querySelectorAll(".video__comment-editForm");
  const target = e.currentTarget;
  const removeBtn = target.nextSibling;
  commentText = target.previousSibling;
  // FIXME: 수정하기를 누른 후, 다른 댓글을 수정하기로 하면, 텍스트가 덮어 쓰임
  if (exists.length >= 1) {
    exists.forEach((e) => {
      e.nextSibling.click();
    });
  }
  if (commentText.tagName !== "SPAN") {
    commentText.select();
    return;
  }
  const input = document.createElement("textarea");
  input.className = "video__comment-text";
  input.value = commentText.innerText;
  const submit = document.createElement("button");
  submit.className = "video__comment-editSubmit fa-solid fa-check";
  submit.setAttribute("type", "submit");
  submit.addEventListener("click", editCommentSubmit);
  const cancel = document.createElement("button");
  cancel.className = "video__comment-editCancel fa-solid fa-ban";
  const createForm = document.createElement("form");
  createForm.className = "video__comment-editForm";
  createForm.addEventListener("submit", (e) => e.preventDefault());

  commentText.replaceWith(createForm);
  createForm.append(input, submit);
  removeBtn.replaceWith(cancel);
  cancel.addEventListener("click", editCommentCancel);

  // 기존 btn 삭제
  target.remove();
  removeBtn.remove();

  // input 요소 드래그 선택
  input.select();
};

const editCommentSubmit = async (e) => {
  const editForm = document.querySelector(".video__comment-editForm");
  const text = editForm.querySelector(".video__comment-text").value;
  const li = editForm.closest(".video__comment");
  const index = Array.prototype.indexOf.call(videoComments.children, li);

  await fetch(`/api/videos/${videoId}/comment-edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, index }),
  });
};

const editCommentCancel = (e) => {
  const target = e.currentTarget;
  const targetForm = target.previousSibling;
  const li = target.closest(".video__comment");
  const value = commentText.innerText;
  // const value = targetForm.querySelector("textarea").value;
  const span = document.createElement("span");
  span.className = "video__comment-text";
  span.innerText = value;

  const editBtn = document.createElement("button");
  editBtn.className = "video_-comment-edit fa-solid fa-pen-to-square";
  editBtn.addEventListener("click", editComment);

  const removeBtn = document.createElement("button");
  removeBtn.className = "video__comment-delete fa-solid fa-trash-can";
  removeBtn.addEventListener("click", removeComment);

  targetForm.replaceWith(span);
  target.replaceWith(removeBtn);
  li.insertBefore(editBtn, removeBtn);
};

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

if (form) {
  form.addEventListener("submit", handleSubmit);

  editBtn.forEach((btn) => {
    btn.addEventListener("click", editComment);
  });

  deleteBtn.forEach((btn) => {
    btn.addEventListener("click", removeComment);
  });
}
