const log = console.log.bind(console);
const synth = window.speechSynthesis;
// english voice is array item # 10 if it's ios; 4 if windows/android;
const englishVoice = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 10 : 4;

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
  populateAnswers();
});

document.querySelectorAll(".userChoice").forEach((element) => {
  element.addEventListener("click", (e) => {
    if (e.target.dataset.check == answer.check) {
      e.target.classList.add("correct");
      speak("That's right!");
    } else {
      e.target.classList.add("error");
      speak("Incorrect!");
      speak(answer.msg);
    }
  });
});

document.getElementById("openModal").addEventListener("click", (e) => {
  document.getElementById("modal").classList.add("openModal");
});

document.getElementById("closeModal").addEventListener("click", () => {
  if (
    [
      document.getElementById("upperCaseNormal"),
      document.getElementById("lowerCaseNormal"),
      document.getElementById("numberCharacters"),
      document.getElementById("upperCaseCursive"),
      document.getElementById("lowerCaseCursive"),
    ].every((btn) => {
      return btn.checked == false;
    })
  ) {
    document.getElementById("upperCaseNormal").checked = true;
  }
  document.getElementById("modal").classList.remove("openModal");
});

document.getElementById("selectAll").addEventListener("click", () => {
  toggleSelectAllBtn();
});

function toggleSelectAllBtn() {
  if (document.getElementById("selectAll").dataset.toggle == "false") {
    document.getElementById("upperCaseNormal").checked = true;
    document.getElementById("lowerCaseNormal").checked = true;
    document.getElementById("numberCharacters").checked = true;
    document.getElementById("upperCaseCursive").checked = true;
    document.getElementById("lowerCaseCursive").checked = true;
    colorSelectAllBtn();
  } else {
    document.getElementById("lowerCaseNormal").checked = false;
    document.getElementById("numberCharacters").checked = false;
    document.getElementById("upperCaseCursive").checked = false;
    document.getElementById("lowerCaseCursive").checked = false;
    colorSelectAllBtn();
  }
}

let cbArray = [
  document.getElementById("upperCaseNormal"),
  document.getElementById("lowerCaseNormal"),
  document.getElementById("numberCharacters"),
  document.getElementById("upperCaseCursive"),
  document.getElementById("lowerCaseCursive"),
];

cbArray.forEach((btn) => {
  btn.addEventListener("change", () => {
    colorSelectAllBtn();
    let allUnChecked = cbArray.every((btn) => {
      return btn.checked == false;
    });
    if (allUnChecked) {
      document.getElementById("upperCaseNormal").checked = true;
    }
  });
});

function colorSelectAllBtn() {
  let allChecked = [
    document.getElementById("upperCaseNormal"),
    document.getElementById("lowerCaseNormal"),
    document.getElementById("numberCharacters"),
    document.getElementById("upperCaseCursive"),
    document.getElementById("lowerCaseCursive"),
  ].every((btn) => {
    return btn.checked == true;
  });

  if (allChecked) {
    document.getElementById("selectAll").dataset.toggle = true;
    document.getElementById("selectAll").classList.add("toggled");
  } else {
    document.getElementById("selectAll").dataset.toggle = false;
    document.getElementById("selectAll").classList.remove("toggled");
  }
}

function init() {
  let ucNorm = fetch("./json/upperCaseLetters.json").then((response) => {
    return response.json();
  });

  let lcNorm = fetch("./json/lowerCaseLetters.json").then((response) => {
    return response.json();
  });

  let ucCursive = fetch("./json/upperCaseCursive.json").then((response) => {
    return response.json();
  });

  let lcCursive = fetch("./json/lowerCaseCursive.json").then((response) => {
    return response.json();
  });

  let numCharacters = fetch("./json/numbers.json").then((response) => {
    return response.json();
  });

  Promise.all([ucNorm, lcNorm, ucCursive, lcCursive, numCharacters]).then(
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

function speak(textToSpeak) {
  let voices = synth.getVoices();
  let speech = new SpeechSynthesisUtterance(textToSpeak);
  speech.voice = voices[englishVoice];
  speechSynthesis.speak(speech);
}

function populateAnswers() {
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

  cbList.forEach((cb, i) => {
    if (document.getElementById(cb).checked) {
      answerArray.push(...objList[i]);
    }
  });

  answerArray = answerArray.length > 0 ? answerArray : lowerCaseNormal;

  let letterList = answerArray;

  let choiceArray = ["", "", "", ""];
  let lastUsedObj = {};
  let randomObj = randomQuery(answerArray);
  answer = randomObj;

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
  speak("Hello Karra! " + answer.msg);
}

init();
