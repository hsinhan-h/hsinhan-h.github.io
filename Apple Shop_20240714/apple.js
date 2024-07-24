import {
  renderGalleryImages,
  renderPrice,
  renderVAT,
  renderStorage,
  renderCartImage,
  renderPackaging,
} from "./rendering.js";

const specSelect = document.querySelector(".spec-selection");
const modelSelect = document.querySelector(".model-selection");
const colorSelect = document.querySelector(".color-selection");
const storageSelect = document.querySelector(".storage-selection");
let selectedModel;
let selectedColor;
let selectedStorage;
let selectedPrice;
let data;

const iPhoneDataUrl = "iphone_data.json";
async function fetchData(url) {
  return await fetch(url).then((res) => res.json());
}
window.addEventListener("load", initPage);

//add button focus effect
specSelect.addEventListener(
  "click",
  (e) => {
    if (
      e.target.closest(".select-box") &&
      !e.target.classList.contains("disabled")
    ) {
      e.target
        .closest(".selection-block")
        .querySelectorAll(".select-box")
        .forEach((selectBox) => {
          selectBox.classList.toggle(
            "focused-box",
            selectBox === e.target.closest(".select-box")
          );
        });
    }
  },
  true
);

//handle models info
modelSelect.addEventListener("click", (e) => {
  if (e.target.closest(".select-box")) {
    selectedModel = e.target
      .closest(".select-box")
      .querySelector(".model-name").textContent;

    //update gallery images
    const colorSelectBoxes = Array.from(
      document.querySelectorAll(".color-choice .select-box")
    );
    if (e.target.closest(".select-box").classList.contains("focused-box")) {
      if (
        !colorSelectBoxes.some((box) => box.classList.contains("focused-box")) //while no color box has been selected
      ) {
        const imgs = data.find(
          (data) => data.model === selectedModel
        ).galleryImages;
        renderGalleryImages(imgs);
      } else {
        const imgs = getModelColorObject(selectedColor).galleryImages;
        renderGalleryImages(imgs);
      }
    }

    //update selected model
    document
      .querySelectorAll(".selected-model")
      .forEach((model) => (model.textContent = selectedModel));
    document.querySelector(".accessories p").textContent = selectedModel;

    //update price
    if (!selectedStorage) {
      selectedPrice = e.target
        .closest(".select-box")
        .querySelector(".price-floor").textContent;
    } else {
      selectedPrice = getModelColorStorageObject(
        selectedColor,
        selectedStorage
      ).priceNTD;
    }
    updateStorageBoxPrice(selectedModel);
    renderPrice(selectedPrice);
    renderVAT();

    // enable color selection after model selected
    colorSelect.querySelectorAll(".select-box").forEach((colorBox) => {
      if (colorBox.classList.contains("disabled")) {
        colorBox.classList.remove("disabled");
      }
    });
  }
});

//handle colors info
let objOfTargetColor;
let selectedColorZH;
let tempColorZH;

colorSelect.addEventListener("click", (e) => {
  if (
    e.target.closest(".select-box") &&
    !e.target.classList.contains("disabled")
  ) {
    selectedColor = e.target.closest(".select-box").getAttribute("color");
    objOfTargetColor = getModelColorObject(selectedColor);
    if (objOfTargetColor) {
      selectedColorZH = objOfTargetColor.colorZH;
      document.querySelector(
        ".selected-color:not(.init-color)"
      ).textContent = ` - ${selectedColorZH}`;
    }
    document.querySelector(".init-color").textContent = selectedColorZH;

    const imgs = objOfTargetColor.galleryImages;
    renderGalleryImages(imgs);
    renderCartImage(objOfTargetColor);
    renderPackaging(objOfTargetColor);

    //enable storage selection
    storageSelect.querySelectorAll(".select-box").forEach((storageBox) => {
      if (storageBox.classList.contains("disabled")) {
        storageBox.classList.remove("disabled");
      }
    });
  }
});

colorSelect.addEventListener("mouseover", (e) => {
  if (
    e.target.closest(".select-box") &&
    !e.target.classList.contains("disabled")
  ) {
    const tempColor = e.target.closest(".select-box").getAttribute("color");
    objOfTargetColor = getModelColorObject(tempColor);
    if (objOfTargetColor) {
      tempColorZH = objOfTargetColor.colorZH;
      document.querySelector(
        ".selected-color:not(.init-color)"
      ).textContent = ` - ${tempColorZH}`;
    }
  }
});

colorSelect.addEventListener("mouseout", (e) => {
  document.querySelector(".selected-color:not(.init-color)").textContent =
    selectedColorZH ? ` - ${selectedColorZH}` : "";
});

//handle storage info
storageSelect.addEventListener("click", (e) => {
  if (
    e.target.closest(".select-box") &&
    !e.target.closest(".select-box").classList.contains("disabled")
  ) {
    selectedStorage = e.target
      .closest(".select-box")
      .querySelector(".capacity").textContent;
    const obj = getModelColorStorageObject(selectedColor, selectedStorage);
    selectedPrice = obj.priceNTD;
    renderStorage(selectedStorage);
    renderPrice(selectedPrice);
    renderVAT();
  }
});

function getModelColorObject(color) {
  return data
    .find((data) => data.model === selectedModel)
    .specifications.find((spec) => spec.color === color);
}

function getModelColorStorageObject(color, storage) {
  return data
    .find((data) => data.model === selectedModel)
    .specifications.find(
      (spec) => spec.color === color && spec.storageGB == selectedStorage
    );
}

function updateStorageBoxPrice(selectedModel) {
  const modelObj = data.find((data) => data.model === selectedModel);
  for (let i = 0; i < modelObj.storagesGB.length; i++) {
    const price = modelObj.specifications.find(
      (spec) => spec.storageGB == modelObj.storagesGB[i]
    ).priceNTD;
    storageSelect.querySelector(
      `.select-box:nth-of-type(${i + 1}) .price`
    ).textContent = price;
  }
}

async function initPage() {
  data = await fetchData(iPhoneDataUrl);

  // initCarousel
  const initImages = data[0].initialGalleryImages;
  renderGalleryImages(initImages);

  // initModelSelectBlock();
  const modelChoices = data.length;
  const modelSelectBoxTemplate = document.querySelector(
    "#model-select-box-template"
  );
  for (let i = 0; i < modelChoices; i++) {
    const clone = document.importNode(modelSelectBoxTemplate.content, true);
    clone.querySelector(".model-name").textContent = data[i].model;
    clone.querySelector(".screen").textContent = data[i].screen;
    clone.querySelector(".price-floor").textContent = data[i].priceFloorNTD;
    document.querySelector(".model-selection").append(clone);
  }

  // initColorSelectBlock();
  const colorChoiceBlock = document.querySelector(".color-choice");
  const colors = data[0].colors;
  for (let i = 0; i < colors.length; i++) {
    const [key, value] = Object.entries(colors[i]);
    colorChoiceBlock.innerHTML += `<div class="color select-box disabled" style="background-color:${key[1]}"; color="${key[0]}"></div>`;
  }

  // initStorageSelectBox();
  const storageChoices = data[0].storagesGB.length;
  const storageSelectBoxTemplate = document.querySelector(
    "#storage-select-box-template"
  );
  for (let i = 0; i < storageChoices; i++) {
    const clone = document.importNode(storageSelectBoxTemplate.content, true);
    clone.querySelector(".capacity").textContent = data[0].storagesGB[i];
    clone.querySelector(".price").textContent = data[0].specifications.find(
      (spec) => spec.storageGB === data[0].storagesGB[i]
    ).priceNTD;
    document.querySelector(".storage-selection").append(clone);
  }

  //fill in default price
  document.querySelectorAll(".selected-price").forEach((initPrice) => {
    initPrice.textContent = data[0].priceFloorNTD;
  });

  //fill in VAT
  renderVAT();

  //fill in default model
  document
    .querySelectorAll(".selected-model")
    .forEach((model) => (model.textContent = data[0].model));
  // fill in default color
  document.querySelector(".init-color").textContent =
    data[0].specifications[0].colorZH;
  //fill in default storage
  document.querySelector(".selected-storage").textContent =
    data[0].storagesGB[0];

  //init car image
  document.querySelector(".cart-image").src =
    data[0].specifications[0].cartImage;

  //init packaging
  const packagingItemsCount = data[0].packagingItems.length;
  const packagingItemTemplate = document.querySelector(
    "#packaging-item-template"
  );

  for (let i = 0; i < packagingItemsCount; i++) {
    const clone = document.importNode(packagingItemTemplate.content, true);
    clone.querySelector("img").src =
      data[0].specifications[0].packagingImage[i];
    clone.querySelector("p").textContent = data[0].packagingItems[i];
    document.querySelector(".packaging-content").append(clone);
  }
}
