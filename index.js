import { Grid, Game } from "./app.js";

const widthInput = document.getElementById('width-input');

const createButton = document.getElementById('create-button');
const randomButton = document.getElementById('random-button');
const resetButton = document.getElementById('reset-button');
const stopButton = document.getElementById('stop-button');

const grid = new Grid(widthInput.value, document.getElementById('grid-container'));
const game = new Game(grid);

widthInput.addEventListener('change', (e) => {
    if (parseInt(e.target.value, 10) > 10) {
        grid.redraw(parseInt(e.target.value, 10) || 200);
    } else {
        alert("Число клеток должно быть больше 10");
        widthInput.value = 11;
        grid.redraw(11 || 200);
    }
});

randomButton.addEventListener('click', () => {
    grid.randomize();
});
createButton.addEventListener('click', () => {
    widthInput.disabled = true;
    createButton.disabled = true;
    randomButton.disabled = true;
    stopButton.disabled = false;
    grid.setDisabled(true);

    game.start();
});
resetButton.addEventListener('click', () => {
    game.stop();
    grid.reset();
    widthInput.disabled = false;
    createButton.disabled = false;
    stopButton.disabled = true;
    randomButton.disabled = false;
    grid.setDisabled(false);
});
stopButton.addEventListener('click', () => {
    widthInput.disabled = false;
    createButton.disabled = false;
    stopButton.disabled = true;

    game.stop();
});