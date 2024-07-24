const shopTitleSticky = document.querySelector('.shop-title-sticky');
const handleScroll = () => {
    if (window.scrollY > 160) {
        if (shopTitleSticky.classList.contains('d-none')) {
            shopTitleSticky.classList.remove('d-none');
        }
        window.removeEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScrollBack);
    }
};

const handleScrollBack = () => {
    if (window.scrollY <= 160) {
        shopTitleSticky.classList.add('d-none');
        window.removeEventListener('scroll', handleScrollBack);
        window.addEventListener('scroll', handleScroll);
    }
};

window.addEventListener('scroll', handleScroll);

const purchaseSection = document.querySelector('.purchase');
window.addEventListener('scroll', () => {
    const maxWidth = 2000;
    let newWidth = Math.min(window.scrollX + window.innerWidth, maxWidth);
    purchaseSection.style.width = `${newWidth}px`;
})