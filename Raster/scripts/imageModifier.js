//https://habrahabr.ru/post/145816/

let imageData;
let context = document.getElementById('ImageObject').getContext('2d');

function onLoadImage(value) {
    context.drawImage(myImg, 0, 0);
    imageData = context.getData();
}

function onChangeBrightness(value) {

}
function onChangeSaturation(value) {

}
function onChangeHue(value) {

}