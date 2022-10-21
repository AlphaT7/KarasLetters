let log = console.log.bind(console);
const synth = window.speechSynthesis;

let choice = document.getElementById("questionBtn");
let c1 = document.getElementById("c1");
let c2 = document.getElementById("c2");
let c3 = document.getElementById("c3");
let upperCase = {};
let lowerCase = {};
let answerArray = {};
let answer = "";

choice.innerText = "?";
c1.innerText = "?";
c2.innerText = "?";
c3.innerText = "?";

choice.addEventListener("click", () => {
  speak();
});

document.querySelectorAll(".userChoice").forEach((element) => {
  element.addEventListener("click", (e) => {
    if (e.target.innerText == answer) {
      console.log(true);
    } else {
      console.log(false);
    }
  });
});

function init() {
  let upperCaseLetters = fetch("./assets/json/upperCaseLetters.json").then(
    (response) => {
      return response.json();
    }
  );

  let lowerCaseLetters = fetch("./assets/json/lowerCaseLetters.json").then(
    (response) => {
      return response.json();
    }
  );

  Promise.all([upperCaseLetters, lowerCaseLetters]).then((values) => {
    answerArray = { ...values[0], ...values[1] };
  });
}

function randomQuery(objArray) {
  return objArray[
    (Math.random() * (Object.keys(objArray).length - 1)).toFixed(0)
  ];
}

function randomLetter(letters) {
  return letters[
    (Math.random() * (Object.keys(letters).length - 1)).toFixed(0)
  ];
}

function filterUsed(letters, exclusion) {
  return letters.filter((letter) => {
    return letter != exclusion;
  });
}

function speak() {
  let answerList = Object.entries(answerArray);
  let letterList = [...Object.keys(answerArray)];
  let voices = synth.getVoices();
  let choiceArray = ["", "", ""];

  let randomObj = randomQuery(answerList)[1];
  answer = randomObj.letter;
  let speech = new SpeechSynthesisUtterance(randomObj.msg);

  choiceArray.map((choice, i, array) => {
    if (i != 0) {
      letterList = filterUsed(letterList, array[i - 1]);
      array[i] = randomLetter(letterList);
    } else {
      array[i] = answer;
    }
  });

  [c1, c2, c3].map((btn, i, array) => {
    if (i != 0) {
      choiceArray = filterUsed(choiceArray, array[i - 1].innerText);
      btn.innerText = randomLetter(choiceArray);
    } else {
      btn.innerText = randomLetter(choiceArray);
    }
  });

  letterList = speech.voice = voices[4];
  speechSynthesis.speak(speech);
}

init();
