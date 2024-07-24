function renderGalleryImages(imgs) {
  const indicatorBtnTemplate = document.querySelector(
    "#indicator-button-template"
  );
  //clear carouselImages
  document.querySelector(".carousel-indicators").innerHTML = "";
  document.querySelector(".carousel-inner").innerHTML = "";
  const ImgQty = imgs.length;
  for (let i = 0; i < ImgQty; i++) {
    const clone = document.importNode(indicatorBtnTemplate.content, true);
    if (i === 0) {
      clone.querySelector("button").setAttribute("aria-current", "true");
      clone.querySelector("button").classList.add("active");
    }
    clone.querySelector("button").setAttribute("data-bs-slide-to", i);
    clone.querySelector("button").setAttribute("aria-label", `Slide ${i + 1}`);
    document.querySelector(".carousel-indicators").append(clone);
    document.querySelector(".carousel-inner").innerHTML += `
      <div class="carousel-item">
      <img src="${imgs[i]}" class="d-block w-100"></img>
      </div>`;
    document
      .querySelector(".carousel-inner .carousel-item")
      .classList.add("active");
  }
}

function renderPrice(selectedPrice) {
  document
    .querySelectorAll(".selected-price")
    .forEach((price) => (price.textContent = selectedPrice));
}

function renderVAT() {
  const price = parseInt(
    document.querySelector(".pricing .price").textContent.replace(/,/g, ""),
    10
  );
  const vat = Math.round((price / 1.05) * 0.05).toLocaleString("zh-Hans-CN");
  document.querySelector(".vat").textContent = vat;
}

function renderStorage(selectedStorage) {
  document
    .querySelectorAll(".selected-storage")
    .forEach((storage) => (storage.textContent = selectedStorage));
}

function renderCartImage(modelColorObj) {
  document.querySelector(".cart-image").src = modelColorObj.cartImage;
}

function renderPackaging(modelColorObj) {
  const imgQty = modelColorObj.packagingImage.length;
  for (let i = 0; i < imgQty; i++) {
    document.querySelector(
      `.packaging-content .accessories:nth-of-type(${i + 1}) img`
    ).src = modelColorObj.packagingImage[i];
  }
}

export {
  renderGalleryImages,
  renderPrice,
  renderVAT,
  renderStorage,
  renderCartImage,
  renderPackaging,
};
