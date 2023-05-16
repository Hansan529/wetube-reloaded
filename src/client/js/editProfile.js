const file = document.getElementById("edit-profile__file");
const preview = document.querySelector(".edit-profile__img");

file.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    preview.src = reader.result;
  };
  reader.readAsDataURL(file);
});
