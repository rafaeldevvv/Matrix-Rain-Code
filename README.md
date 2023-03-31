# MATRIX RAIN CODE

## Table of contents

- [Overview](#overview)
- [My process](#my-process)
  - [Introduction](#introduction)
  - [Global variables](#global-variables)
  - [Helper Functions](#helper-functions)
  - [Rendering](#rendering)
  - [Animation](#animation)
- [Author](#author)

## Overview

This is a small project that aims to make the Matrix Rain Code Effect with JavaScript.

Live Site URL: [here](https://rafaeldevvv.github.io/Matrix-Rain-Code/)

## My Process

### Introduction

To start this project, I went on YouTube to see how the behavior of the Rain Code was and my first idea was to make it with CSS animations and DOM nodes by recreating them every time they reached the bottom. But as you might expect, that idea didn't go so well. My computer couldn't even open the document.

So I had to take another approach to this project. After some time thinking and seeing over and over the Matrix Rain Code video, I realized that I could do this without recreating the DOM nodes every time they reached the bottom and without CSS animations. I could actually use the same DOM nodes and just style them to make it looks like a rain code. I also realized that the Rain was kind of static - the letters didn't change position, they just sort of lit up according to the current position of some column.

I must say that this approach isn't very good because it is still very slow if the screen is too big or if the device isn't that fast.

### Global variables

At first I tried to get a random character from the string itself, but it didn't work because JS uses two code units for special characters like these. I was getting undefined instead of a character. So I just used the Array.from() method, which gives me an array from a string. The delayVariation describes the maximum time the active part of column remains outside the screen before going down. maxHeight describes the maximum height of the active part of a column. lettersPerSecond is the speed.

```js
const lettersString = "ツテぱびぷのねぬとなゟゑをゐわれるむぬマヤカ阿加多";
const letters = Array.from(lettersString);

const delayVariation = 50;
const maxHeight = 50;
const lettersPerSecond = 25;
```

### Helper Functions

I use the elt function to create an element with given properties(DOM properties like "className" instead of just "class") and children. The random number gives me a random number between two numbers(not an integer). randomItem gives me a random item in an array.

```js
function elt(type, attrs, ...children) {
  const dom = document.createElement(type);
  if (attrs) Object.assign(dom, attrs);

  for (let child of children) {
    if (typeof child == "string")
      dom.appendChild(document.createTextNode(child));
    else dom.appendChild(child);
  }

  return dom;
}

function randomNumber(min = 0, max) {
  return min + Math.random() * (max - min);
}

function randomItem(array) {
  return array[Math.floor(randomNumber(0, array.length))];
}
```

This is an extremely useful function for running animations. I saw this in Eloquent JavaScript By Marijn Haverbeke and just adapted it a little bit. Instead of making the frameFunc return a Boolean to signal when the animation should stop, it runs forever.

```js
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      frameFunc(timeStep);
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
```

I use these ones to create predefined opacities and colors for an active part with a given height so that I don't need to regenerate these every time the column updates.

Also, at first I was recalculating the active parts in every update and the first character in each column was always with opacity 0. This was bothering me and I made these functions.

```js
function generateColors(height) {
  const colors = [];

  // the increments were chosen arbitrarily
  const brightnessIncrement = 3;
  const colorIncrement = 15;
  let color = 120,
    brightness = 50;

  for (let i = 0; i < height; i++) {
    colors.push(`hsl(${color}, 100%, ${brightness}%)`);

    if (i > height - 5) {
      color -= colorIncrement;
      brightness += brightnessIncrement;
    }
  }

  return colors;
}

function generateOpacities(height) {
  const opacities = [];

  const opacityIncrement = 1 / (height / 1.5);
  let opacity = 0;

  for (let i = 0; i < height; i++) {
    opacities.push(opacity);
    opacity += opacityIncrement;
  }

  return opacities;
}
```

### Rendering

This function will render characters and columns until the whole screen is filled with them. This part is totally dependent on the CSS. The min-content and max-content values was extremely useful here both in the columns and in the wrapper. And also you might be thinking that I could create all the DOM nodes and then append them to the body, but this function also needs the nodes to be appended to their parents while they are being created. This is because we verify that the width of the wrapper and the height of each column are smaller than the width and height of the document, respectively.

We don't need to worry about giving a random speed to each column. They can have the same speed because columns with different font sizes will have different speeds.

```js
function renderColumns() {
  const columns = [];

  const wrapper = elt("div", { className: "wrapper" });
  document.body.appendChild(wrapper);

  for (; wrapper.clientWidth < innerWidth; ) {
    const column = elt("div", { className: "column" });
    column.style.fontSize = randomNumber(13, 23) + "px";
    wrapper.appendChild(column);

    const lettersDOM = [];
    for (; column.clientHeight < innerHeight; ) {
      const letter = elt("span", { className: "letter" }, randomItem(letters));
      letter.style.opacity = "0";

      lettersDOM.push(letter);
      column.appendChild(letter);
    }

    columns.push(lettersDOM);
  }

  return columns;
}
```

```css
.wrapper {
  display: flex;
  width: max-content;
  user-select: none;
}

.column {
  display: flex;
  width: min-content;
  height: max-content;
  flex-direction: column;
}
```

### Animation

Each column will manage its own animation - I guess that's one of the reasons why this code does not have good performance. 

The animateColumn function keeps a currentIndex variable which describes the index of the first character of the active part of a column. The program will update the next characters after the first one depending on the height. When the currentIndex is larger than the height of the column - meaning we reached the bottom, the program generates a new height, new colors and opacities for more randomness.

The currentIndex variable is updated depending on the time step passed as argument by the runAnimation function to the callback. That's why we need to hide the letters before updating them. Depending on the timeStep, some characters might be skipped and won't be updated, remaining with opacity different than zero.

When the program goes to style the letters, I used slice to pass only the active part of the column for the styleLetters function. It also receives the colors, opacities and the current index as argument. By passing the current index as argument, we can style the characters correctly because if the current index is negative we need to skip some colors and opacities to give the column an impression that the active part is coming from somewhere beyond the start of the column. Otherwise, the impression would be that the active part was being created from beginning to end.

```js
async function animateColumn(column) {
  let height = randomNumber(0, maxHeight);
  let colors = generateColors(height);
  let opacities = generateOpacities(height);

  let currentIndex = -height - randomNumber(0, delayVariation);

  function updateColumn() {
    hideAllLetters(column);
    styleLetters(
      column.filter((_, i) => i > currentIndex && i < currentIndex + height),
      colors,
      opacities,
      currentIndex
    );
  }

  runAnimation((time) => {
    currentIndex += time * lettersPerSecond;

    if (currentIndex > column.length) {
      height = randomNumber(4, maxHeight);
      colors = generateColors(height);
      opacities = generateOpacities(height);
      currentIndex = -height - randomNumber(0, delayVariation);
    }

    updateColumn();
  });
}

function hideAllLetters(letters) {
  letters.forEach((l) => (l.style.opacity = 0));
}

function styleLetters(letters, colors, opacities, index) {
  letters.forEach((l, i) => {
    if (index < 0) i = Math.floor(i + Math.abs(index));

    l.style.opacity = opacities[i];
    l.style.color = colors[i];
  });
}
```

## Author
- [Instagram](https://www.instagram.com/rafaeldevvv)
- [Twitter](https://www.twitter.com/rafaeldevvv)
- [Front End Mentor](https://www.frontendmentor.io/profile/rafaeldevvv)