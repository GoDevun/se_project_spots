import "./pages/index.css";
import Api from "./utils/Api.js";
import {
  enableValidation,
  resetValidation,
  settings,
} from "./scripts/validation.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    // Replace this placeholder with your personal token from
    // https://around-api.en.tripleten-services.com/v1/users/create
    authorization: "7c684cf6-2f00-4e44-bd9a-c77cab113dee",
    "Content-Type": "application/json",
  },
});

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const profileFormEl = editProfileModal.querySelector(".modal__form");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);
const editProfileSubmitBtn =
  editProfileModal.querySelector(".modal__submit-btn");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostFormEl = newPostModal.querySelector(".modal__form");
const newPostImageInput = newPostModal.querySelector("#new-post-image-input");
const newPostCaptionInput = newPostModal.querySelector(
  "#new-post-caption-input",
);
const newPostSubmitBtn = newPostModal.querySelector(".modal__submit-btn");

const avatarBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarFormEl = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#avatar-input");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");

const deleteModal = document.querySelector("#delete-modal");
const deleteFormEl = deleteModal.querySelector(".modal__form");
const deleteSubmitBtn = deleteModal.querySelector(".modal__submit-btn");
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

let selectedCard;
let selectedCardId;

function setButtonText(
  buttonEl,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving...",
) {
  buttonEl.textContent = isLoading ? loadingText : defaultText;
}

function handleLike(likeBtnEl, cardId) {
  const isLiked = likeBtnEl.classList.contains("card__like-btn_active");
  api
    .changeLikeStatus(cardId, isLiked)
    .then(() => {
      likeBtnEl.classList.toggle("card__like-btn_active");
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteModal);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content.cloneNode(true);
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardEl = cardElement.querySelector(".card");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardNameEl.textContent = data.name;

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardEl, data),
  );

  cardLikeBtnEl.addEventListener("click", () =>
    handleLike(cardLikeBtnEl, data._id),
  );

  cardImageEl.addEventListener("click", () => {
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleEscKeydown(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscKeydown);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscKeydown);
}

const modals = document.querySelectorAll(".modal");
modals.forEach(function (modal) {
  modal.addEventListener("mousedown", function (evt) {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
  const closeBtn = modal.querySelector(".modal__close-btn");
  closeBtn.addEventListener("click", function () {
    closeModal(modal);
  });
});

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(profileFormEl, settings);
  openModal(editProfileModal);
});

profileFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();
  setButtonText(editProfileSubmitBtn, true);
  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((userData) => {
      profileNameEl.textContent = userData.name;
      profileDescriptionEl.textContent = userData.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(editProfileSubmitBtn, false);
    });
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();
  setButtonText(newPostSubmitBtn, true);
  api
    .addCard({
      name: newPostCaptionInput.value,
      link: newPostImageInput.value,
    })
    .then((cardData) => {
      const card = getCardElement(cardData);
      cardsList.prepend(card);
      newPostFormEl.reset();
      resetValidation(newPostFormEl, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(newPostSubmitBtn, false);
    });
});

avatarBtn.addEventListener("click", function () {
  resetValidation(avatarFormEl, settings);
  openModal(avatarModal);
});

avatarFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();
  setButtonText(avatarSubmitBtn, true);
  api
    .editAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatarEl.src = userData.avatar;
      avatarFormEl.reset();
      resetValidation(avatarFormEl, settings);
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(avatarSubmitBtn, false);
    });
});

deleteCancelBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

deleteFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();
  setButtonText(deleteSubmitBtn, true, "Delete", "Deleting...");
  api
    .removeCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(deleteSubmitBtn, false, "Delete", "Deleting...");
    });
});

enableValidation(settings);

api
  .getAppInfo()
  .then(([userData, cards]) => {
    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatarEl.src = userData.avatar;

    cards.forEach((cardData) => {
      const card = getCardElement(cardData);
      cardsList.append(card);
    });
  })
  .catch(console.error);
