/**
 * This nice class ensures anywhere where it is requested than we get the much desired mouse info
 * @type {{x: number, y: number}}
 */
const mouse = {
    x: 0,
    y: 0
};

window.addEventListener('mousemove', (e)=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

module.exports = mouse;