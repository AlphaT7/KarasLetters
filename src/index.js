import * as IDB from "idb-keyval";
const log = console.log.bind(console);
const synth = window.speechSynthesis;
// english voice is array item # 10 if it's ios; # 4 if windows/android;
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
let audioCtx = new AudioContext();
let gameTune = {};
let answer = "";
let deferredPrompt;

IDB.get("isInstalled").then((val) => {
  // check the IndexedDb to see if the app is installed
  if (val) {
    document.getElementById("installApp").innerHTML =
      "<div>download_done</div>";
    document.getElementById("installApp").classList.add("toggled");
  }
});

IDB.get("users").then((users) => {
  users = users ?? { Karra: true };
  document.getElementById("speakBtn").dataset.user = Object.keys(users).filter(
    (key) => {
      return users[key] == true;
    }
  );
});

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevents the default mini-infobar or install dialog from appearing on mobile
  e.preventDefault();
  // Save the event to use it later.
  deferredPrompt = e;
  log(deferredPrompt);
  IDB.set("isInstalled", false);
  document.getElementById("installApp").innerHTML = "<div>install_mobile</div>";
  document.getElementById("installApp").classList.remove("toggled");

  document.getElementById("installApp").addEventListener("click", async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome == "accepted") {
      IDB.set("isInstalled", true);
      document.getElementById("installApp").innerHTML =
        "<div>download_done</div>";
      document.getElementById("installApp").classList.add("toggled");
    }
  });
});

choice.addEventListener("click", (e) => {
  if (synth.speaking) return;
  document.querySelectorAll(".userChoice").forEach((element) => {
    element.classList.remove("correct");
    element.classList.remove("error");
    element.classList.remove("cursive");
  });
  populateAnswers(e.target.dataset.user);
});

document.querySelectorAll(".userChoice").forEach((element) => {
  element.addEventListener("click", (e) => {
    if (synth.speaking) return;
    if (e.target.dataset.check == answer.check) {
      e.target.classList.add("correct");
      speak("That's right!");
    } else {
      e.target.classList.add("error");
      speak("Incorrect!");
    }
  });
});

document.getElementById("playMusic").addEventListener("click", (e) => {
  if (!e.target.checked) {
    gameTune.currentTime = audioCtx.currentTime;
    gameTune.node.stop();
  } else {
    gameTune.node = new AudioBufferSourceNode(audioCtx, { loop: true });
    gameTune.node.buffer = gameTune.audioBuffer;
    gameTune.gainNode = audioCtx.createGain();
    gameTune.gainNode.gain.value = 0.15;
    gameTune.node.connect(gameTune.gainNode).connect(audioCtx.destination);
    gameTune.node.start();
  }
});

document.getElementById("openModal").addEventListener("click", (e) => {
  document.getElementById("modal").classList.add("openModal");
});

document.querySelectorAll(".gridBtn").forEach((btn) => {
  btn.addEventListener("mouseenter", (e) => {
    e.target.style.zIndex = 100;
  });
  btn.addEventListener("mouseleave", (e) => {
    e.target.style.zIndex = 0;
  });
  btn.addEventListener("click", (event) => {
    event.target.style.zIndex = 100;
  });
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

document.getElementById("addUser").addEventListener("click", () => {
  addUser();
});

function selectUser(user) {
  IDB.get("users")
    .then((rs) => {
      Object.keys(rs).map((key) => {
        rs[key] = false;
      });
      rs[user] = true;
      return rs;
    })
    .then((rs) => {
      IDB.set("users", rs);
      return rs;
    })
    .then((rs) => {
      document.getElementById("speakBtn").dataset.user = user;
      displayUsers(rs);
    });
}

function addUser() {
  let person = prompt("Please enter the user name you wish to add.");
  if (person.length > 0) {
    IDB.get("users")
      .then((rs) => {
        rs[person] = false;
        return rs;
      })
      .then((rs) => {
        IDB.set("users", rs);
        return rs;
      })
      .then((rs) => {
        displayUsers(rs);
      });
  }
}

function editUser(user) {
  IDB.get("users")
    .then((rs) => {
      let person = prompt("Please enter a new user name.");
      if (person.length != 0) {
        delete Object.assign(rs, { [person]: rs[user] })[user];
      }
      return rs;
    })
    .then((rs) => {
      IDB.set("users", rs);
      return rs;
    })
    .then((rs) => {
      displayUsers(rs);
    });
}

function removeUser(user) {
  IDB.get("users")
    .then((rs) => {
      if (Object.keys(rs).length > 1 && !rs[user]) {
        let check = confirm(`Are you sure you want to remove user: ${user}?`);
        if (check) {
          delete rs[user];
        }
      } else {
        alert("The selected user or last user cannot be removed.");
      }
      return rs;
    })
    .then((rs) => {
      IDB.set("users", rs);
      return rs;
    })
    .then((rs) => {
      displayUsers(rs);
    });
}

function displayUsers(users) {
  users = Object.keys(users)
    .sort()
    .reduce((obj, key) => {
      obj[key] = users[key];
      return obj;
    }, {});
  document.getElementById("usersTableBody").innerHTML = "";
  for (const [key, value] of Object.entries(users)) {
    document.getElementById(
      "usersTableBody"
    ).innerHTML += `<tr><td data-user="${key}" class='${
      value ? "selectedUser" : "unselectedUser"
    }'>${key}</td>${
      value
        ? "<td><div class='material-icons'>done_all</div></td>"
        : "<td></td>"
    }<td><div data-user="${key}" class="material-icons editUser">edit</div></td><td><div data-user="${key}" class="material-icons removeUser">person_remove</div></td></tr>`;
  }
  document.querySelectorAll(".removeUser").forEach((el) => {
    el.addEventListener("click", (e) => {
      removeUser(e.target.dataset.user);
    });
  });
  document.querySelectorAll(".editUser").forEach((el) => {
    el.addEventListener("click", (e) => {
      editUser(e.target.dataset.user);
    });
  });
  document.querySelectorAll(".unselectedUser").forEach((el) => {
    el.addEventListener("click", (e) => {
      selectUser(e.target.dataset.user);
    });
  });
}

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
  // Register the serviceworker for installation and cacheing capabilities
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }

  let ucNorm = fetch("./assets/json/upperCaseLetters.json").then((response) => {
    return response.json();
  });

  let lcNorm = fetch("./assets/json/lowerCaseLetters.json").then((response) => {
    return response.json();
  });

  let ucCursive = fetch("./assets/json/upperCaseCursive.json").then(
    (response) => {
      return response.json();
    }
  );

  let lcCursive = fetch("./assets/json/lowerCaseCursive.json").then(
    (response) => {
      return response.json();
    }
  );

  let numCharacters = fetch("./assets/json/numbers.json").then((response) => {
    return response.json();
  });

  let users = IDB.get("users")
    .then((rs) => {
      return (
        rs ??
        IDB.set("users", { Karra: true }).then(() => {
          return { Karra: true };
        })
      );
    })
    .then((rs) => {
      displayUsers(rs);
    });

  let tune = IDB.get("tune").then((rs) => {
    return (
      rs ??
      fetch("./assets/audio/karasletters.mp3")
        .then((response) => {
          return response.blob();
        })
        .then((rs) => {
          return IDB.set("tune", rs).then(() => {
            return rs;
          });
        })
    );
  });

  Promise.all([ucNorm, lcNorm, ucCursive, lcCursive, numCharacters, tune])
    .then((rs) => {
      [
        upperCaseNormal,
        lowerCaseNormal,
        upperCaseCursive,
        lowerCaseCursive,
        numberCharacters,
      ] = [rs[0].data, rs[1].data, rs[2].data, rs[3].data, rs[4].data];
      return rs[5];
    })

    .then((rs) => {
      return rs.arrayBuffer();
    })

    .then((rs) => {
      return audioCtx.decodeAudioData(rs);
    })

    .then((rs) => {
      gameTune.audioBuffer = rs;
      document.getElementById("loading").innerHTML =
        "<span class='loader'></span>";
      document.querySelectorAll(".loader")[0].addEventListener("click", (e) => {
        document.getElementById("loading").style.display = "none";
      });
    });
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
  if (!synth.speaking) {
    let voices = synth.getVoices();
    let speech = new SpeechSynthesisUtterance(textToSpeak);
    speech.voice = voices[englishVoice];
    speechSynthesis.speak(speech);
  }
}

function populateAnswers(userName) {
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
  log(userName);
  speak(`Hello ${userName}! ` + answer.msg);
}

init();
