let log = console.log.bind(console);
const synth = window.speechSynthesis;

let choice = document.getElementById("speakBtn");
let c1 = document.getElementById("c1");
let c2 = document.getElementById("c2");
let c3 = document.getElementById("c3");
let c4 = document.getElementById("c4");
let upperCaseNormal = {};
let lowerCaseNormal = {};
let upperCaseCursive = {};
let lowerCaseCursive = {};
let numberCharacters = {};
let answer = "";

choice.addEventListener("click", () => {
  document.querySelectorAll(".userChoice").forEach((element) => {
    element.classList.remove("correct");
    element.classList.remove("error");
    element.classList.remove("cursive");
  });
  speak();
});

document.querySelectorAll(".userChoice").forEach((element) => {
  element.addEventListener("click", (e) => {
    if (e.target.dataset.check == answer.check) {
      e.target.classList.add("correct");
      console.log(true);
    } else {
      e.target.classList.add("error");
      console.log(false);
    }
  });
});

document.getElementById("openModal").addEventListener("click", () => {
  document.getElementById("modal").classList.add("openModal");
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("modal").classList.remove("openModal");
});

function init() {
  let ucNorm = fetch("./json/upperCaseLetters.json").then((response) => {
    return response.json();
  });

  let lcNorm = fetch("./json/lowerCaseLetters.json").then((response) => {
    return response.json();
  });

  let lcCursive = fetch("./json/lowerCaseCursive.json").then((response) => {
    return response.json();
  });

  let ucCursive = fetch("./json/upperCaseCursive.json").then((response) => {
    return response.json();
  });

  let numCharacters = fetch("./json/numbers.json").then((response) => {
    return response.json();
  });

  Promise.all([ucNorm, lcNorm, lcCursive, ucCursive, numCharacters]).then(
    (values) => {
      [
        upperCaseNormal,
        lowerCaseNormal,
        upperCaseCursive,
        lowerCaseCursive,
        numberCharacters,
      ] = [
        values[0].data,
        values[1].data,
        values[2].data,
        values[3].data,
        values[4].data,
      ];
    }
  );
}

function randomQuery(objArray) {
  return objArray[(Math.random() * (objArray.length - 1)).toFixed(0)];
}

function randomCharacter(characters) {
  return characters[(Math.random() * (characters.length - 1)).toFixed(0)];
}

function filterUsed(characters, exclusion) {
  return characters.filter((character) => {
    return character != exclusion;
  });
}

function speak() {
  let answerArray = [];

  let cbList = [
    "upperCaseNormal",
    "lowerCaseNormal",
    "upperCaseCursive",
    "lowerCaseCursive",
    "numberCharacters",
  ];

  let objList = [
    upperCaseNormal,
    lowerCaseNormal,
    upperCaseCursive,
    lowerCaseCursive,
    numberCharacters,
  ];
  log(objList);
  cbList.forEach((cb, i) => {
    if (document.getElementById(cb).checked) {
      answerArray.push(...objList[i]);
    }
  });

  answerArray = answerArray.length > 0 ? answerArray : lowerCaseNormal;

  let letterList = answerArray;

  let voices = synth.getVoices();
  let choiceArray = ["", "", "", ""];
  let lastUsedObj = {};
  let randomObj = randomQuery(answerArray);
  answer = randomObj;
  let speech = new SpeechSynthesisUtterance(randomObj.msg);

  choiceArray.map((choice, i, array) => {
    if (i != 0) {
      letterList = filterUsed(letterList, array[i - 1]);
      array[i] = randomCharacter(letterList);
    } else {
      array[i] = answer;
    }
  });

  [c1, c2, c3, c4].map((btn, i, array) => {
    if (i != 0) {
      choiceArray = filterUsed(choiceArray, lastUsedObj);
      let characterObj = randomCharacter(choiceArray);
      if (characterObj.cursive) {
        btn.classList.add("cursive");
      }
      btn.innerText = characterObj.character;
      btn.dataset.check = characterObj.check;
      lastUsedObj = characterObj;
    } else {
      let characterObj = randomCharacter(choiceArray);
      if (characterObj.cursive) {
        btn.classList.add("cursive");
      }
      btn.innerText = characterObj.character;
      btn.dataset.check = characterObj.check;
      lastUsedObj = characterObj;
    }
  });

  speech.voice = voices[4];
  //speechSynthesis.speak(speech);
}

init();
