const knob = document.querySelector('.knob img');

window.addEventListener('scroll', () => {
    knob.style.transform = `rotate(${window.scrollY / 3}deg)`;
})
