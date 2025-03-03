import * as IDB from "idb-keyval";
import { CircularFluidMeter } from "fluid-meter";
import * as ToolTip from "./assets/modules/tooltip.js";
import * as Confetti from "./assets/modules/confetti.js";
import * as Toast from "@brenoroosevelt/toast/lib/esm/toast.js";

const log = console.log.bind(console);
const synth = window.speechSynthesis;
// defaultVoice is the array number selector for the speechSynthesis;
let defaultVoice;

window.speechSynthesis.onvoiceschanged = function () {
  synth.getVoices().forEach((voice, i) => {
    if (voice.name.includes("Google US English")) {
      defaultVoice = i;
    }
  });

  if (isNaN(defaultVoice)) {
    synth.getVoices().forEach((voice, i) => {
      if (voice.default == true) {
        defaultVoice = i;
      }
    });
  }
};

let speakQuestion = document.getElementById("speakBtn");
let c1 = document.getElementById("c1");
let c2 = document.getElementById("c2");
let c3 = document.getElementById("c3");
let upperCaseNormal = {};
let lowerCaseNormal = {};
let upperCaseCursive = {};
let lowerCaseCursive = {};
let numberCharacters = {};
let audioCtx = new AudioContext();
let soundBuffer = {};
let musicBuffer = {};
let musicNode = {};
let musicTimeStamp = {};
let answer = "";
let answeredCorrectly = true;
let score = 0;
let deferredPrompt;
let currentQuestion = "";

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

document.getElementById("tutorial").addEventListener("click", () => {
  ToolTip.init(true);
});

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevents the default mini-infobar or install dialog from appearing on mobile
  e.preventDefault();
  // Save the event to use it later.
  deferredPrompt = e;

  IDB.set("isInstalled", false);
  document.getElementById("installApp").innerHTML = "<div>install_mobile</div>";
  document.getElementById("installApp").classList.remove("toggled");

  document.getElementById("installApp").addEventListener("click", async () => {
    playSound(soundBuffer.buttonSound, false, 0.25);
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

speakQuestion.addEventListener("click", (e) => {
  if (synth.speaking) return;
  if (!answeredCorrectly) {
    speak(currentQuestion);
  } else {
    document.querySelectorAll(".userChoice").forEach((element) => {
      element.classList.remove("correct");
      element.classList.remove("error");
      element.classList.remove("cursive");
    });

    answeredCorrectly = false;
    populateAnswers(e.target.dataset.user);
  }
});

document.querySelectorAll(".userChoice").forEach((element) => {
  element.addEventListener("click", (e) => {
    if (synth.speaking) {
      Toast.warning("Please wait for the application to finish speaking...", {
        title: "Please Wait!",
        position: "bottom",
        align: "center",
        shadow: true,
        duration: 2500,
        dismissible: true,
      });
      return;
    }
    if (e.target.dataset.check == answer.check) {
      if (!answeredCorrectly) {
        e.target.classList.add("correct");
        score = score + 25 <= 100 ? (score += 25) : 100;
        fluidMeter.progress = score;
        answeredCorrectly = true;
      }
      if (score == 100) {
        fluidMeter.progress = score;
        speak("You win! Would you like to play again?");
        document.getElementById("victory").classList.add("openModal");
        Confetti.init();
      }
      speak("That's right!");
    } else {
      e.target.classList.add("error");
      score = score - 40 >= 0 ? (score -= 40) : 0;
      fluidMeter.progress = score;
      speak("Incorrect!");
    }
  });
});

document.getElementById("replay").addEventListener("click", () => {
  document.getElementById("victory").classList.remove("openModal");
  score = 0;
  fluidMeter.progress = score;
  document.querySelectorAll(".userChoice").forEach((element) => {
    element.classList.remove("correct");
    element.classList.remove("error");
    element.classList.remove("cursive");
  });

  answeredCorrectly = false;
  populateAnswers(document.getElementById("speakBtn").dataset.user);
});

document.getElementById("openModal").addEventListener("click", (e) => {
  playSound(soundBuffer.openMenu, false, 0.25);
  document.getElementById("modal").classList.add("openModal");
});

document.querySelectorAll(".userChoice").forEach((btn) => {
  btn.addEventListener("mouseenter", (e) => {
    e.target.style.zIndex = 2;
  });
  btn.addEventListener("mouseleave", (e) => {
    e.target.style.zIndex = 0;
  });
  btn.addEventListener("click", (event) => {
    event.target.style.zIndex = 2;
  });
});

document.querySelectorAll(".slider").forEach((el) => {
  el.addEventListener("click", () => {
    playSound(soundBuffer.buttonSound, false, 0.25);
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
  playSound(soundBuffer.closeMenu, false, 0.25);
  document.getElementById("modal").classList.remove("openModal");
});

document.getElementById("selectAll").addEventListener("click", () => {
  playSound(soundBuffer.buttonSound, false, 0.25);
  toggleSelectAllBtn();
});

document.getElementById("addUser").addEventListener("click", () => {
  playSound(soundBuffer.buttonSound, false, 0.25);
  addUser();
});

document.getElementById("playMusic").addEventListener("click", (e) => {
  if (!e.target.checked) {
    musicTimeStamp.gameTune.stopped =
      audioCtx.currentTime - musicTimeStamp.gameTune.started;

    musicNode.gameTune.stop();
  } else {
    playMusic(musicBuffer.gameTune, true, 0.25, "gameTune");
  }
});

function playMusic(audioBuffer, loop, volume, musicName) {
  let ts = musicTimeStamp.hasOwnProperty(musicName)
    ? audioCtx.currentTime - musicTimeStamp[musicName].stopped
    : 0;
  musicNode[musicName] = new AudioBufferSourceNode(audioCtx, {
    loop: loop,
  });
  let gainNode = audioCtx.createGain();
  musicNode[musicName].buffer = audioBuffer;
  gainNode.gain.value = volume;
  musicNode[musicName].connect(gainNode).connect(audioCtx.destination);
  (musicTimeStamp[musicName] ??= {}).started = ts;
  musicNode[musicName].start(0, audioCtx.currentTime - ts);
}

async function playSound(audioBuffer, loop, volume) {
  let sound = new AudioBufferSourceNode(audioCtx, { loop: loop });
  let gainNode = audioCtx.createGain();
  sound.buffer = audioBuffer;
  gainNode.gain.value = volume;
  sound.connect(gainNode).connect(audioCtx.destination);
  sound.start(0);
}

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
      let person = prompt("Please enter a new user name.", user);
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
    ).innerHTML += `<tr><td data-user="${key}" class='${value ? "selectedUser" : "unselectedUser"
      }'><div data-user="${key}">${key}</div></td>${value
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
  // Register the service-worker for installation and caching capabilities
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }

  let ucNorm = fetch("../json/upperCaseLetters.json").then((response) => {
    return response.json();
  });

  let lcNorm = fetch("../json/lowerCaseLetters.json").then((response) => {
    return response.json();
  });

  let ucCursive = fetch("../json/upperCaseCursive.json").then((response) => {
    return response.json();
  });

  let lcCursive = fetch("../json/lowerCaseCursive.json").then((response) => {
    return response.json();
  });

  let numCharacters = fetch("../json/numbers.json").then((response) => {
    return response.json();
  });

  IDB.get("users")
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
      fetch("../audio/karasletters.mp3")
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

  let buttonSound = IDB.get("button").then((rs) => {
    return (
      rs ??
      fetch("../audio/button.mp3")
        .then((response) => {
          return response.blob();
        })
        .then((rs) => {
          return IDB.set("button", rs).then(() => {
            return rs;
          });
        })
    );
  });

  let openMenu = IDB.get("open_menu").then((rs) => {
    return (
      rs ??
      fetch("../audio/open_menu.mp3")
        .then((response) => {
          return response.blob();
        })
        .then((rs) => {
          return IDB.set("open_menu", rs).then(() => {
            return rs;
          });
        })
    );
  });

  let closeMenu = IDB.get("close_menu").then((rs) => {
    return (
      rs ??
      fetch("../audio/close_menu.mp3")
        .then((response) => {
          return response.blob();
        })
        .then((rs) => {
          return IDB.set("close_menu", rs).then(() => {
            return rs;
          });
        })
    );
  });

  Promise.all([
    ucNorm,
    lcNorm,
    ucCursive,
    lcCursive,
    numCharacters,
    tune,
    buttonSound,
    openMenu,
    closeMenu,
  ])
    .then((rs) => {
      [
        upperCaseNormal,
        lowerCaseNormal,
        upperCaseCursive,
        lowerCaseCursive,
        numberCharacters,
      ] = [rs[0].data, rs[1].data, rs[2].data, rs[3].data, rs[4].data];
      return {
        tune: rs[5],
        buttonSound: rs[6],
        openMenu: rs[7],
        closeMenu: rs[8],
      };
    })

    .then((rs) => {
      return Promise.all([
        rs.tune.arrayBuffer(),
        rs.buttonSound.arrayBuffer(),
        rs.openMenu.arrayBuffer(),
        rs.closeMenu.arrayBuffer(),
      ]).then((rs) => {
        return {
          tune: rs[0],
          buttonSound: rs[1],
          openMenu: rs[2],
          closeMenu: rs[3],
        };
      });
    })

    .then(async (rs) => {
      await audioCtx
        .decodeAudioData(rs.tune)
        .then((rs) => {
          musicBuffer.gameTune = rs;
        })
        .catch((error) => console.log(error, 1));
      await audioCtx
        .decodeAudioData(rs.buttonSound)
        .then((rs) => {
          soundBuffer.buttonSound = rs;
        })
        .catch((error) => console.log(error, 2));
      await audioCtx
        .decodeAudioData(rs.openMenu)
        .then((rs) => {
          soundBuffer.openMenu = rs;
        })
        .catch((error) => console.log(error, 3));
      await audioCtx
        .decodeAudioData(rs.closeMenu)
        .then((rs) => {
          soundBuffer.closeMenu = rs;
        })
        .catch((error) => console.log(error, 4));
    })

    .then(() => {
      document.getElementById("loading").innerHTML =
        "<div class='loader'>Tap Here!</div>";
      document.querySelectorAll(".loader")[0].addEventListener("click", (e) => {
        document.getElementById("loading").style.display = "none";
        ToolTip.init(false);
      });
    });
}

function randomQuery(objArray) {
  let query = objArray[(Math.random() * (objArray.length - 1)).toFixed(0)];
  if (answer == query) {
    randomQuery(objArray);
  } else {
    return query;
  }
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
    speech.voice = voices[defaultVoice];
    speech.rate = 0.85;
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

  let choiceArray = ["", "", ""];
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

  [c1, c2, c3].map((btn, i, array) => {
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
  currentQuestion = `Hello ${userName}! ${answer.msg}`;

  speak(currentQuestion);
}

init();

const fluidMeter = new CircularFluidMeter(
  document.querySelector("#fluid-meter"),
  {
    initialProgress: 0,
    maxProgress: 100,
    borderWidth: 10,
    borderColor: "#643D88",
    padding: 30,
    backgroundColor: "#E7CEFF",
    showProgress: false,
    showBubbles: true,
    bubbleColor: "#fff",
    use3D: true,
    fluidConfiguration: {
      color: "#800080",
    },
  }
);

particlesJS("particlesWrapper", {
  particles: {
    number: {
      value: 150,
      density: {
        enable: true,
        value_area: 789.1476416322727,
      },
    },
    color: {
      value: "#E7CEFF",
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000",
      },
      polygon: {
        nb_sides: 5,
      },
    },
    opacity: {
      value: 0.48927153781200905,
      random: false,
      anim: {
        enable: true,
        speed: 0.2,
        opacity_min: 0,
        sync: false,
      },
    },
    size: {
      value: 2,
      random: true,
      anim: {
        enable: true,
        speed: 2,
        size_min: 0,
        sync: false,
      },
    },
    line_linked: {
      enable: false,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.2,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "bubble",
      },
      onclick: {
        enable: true,
        mode: "push",
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 83.91608391608392,
        size: 1,
        duration: 3,
        opacity: 1,
        speed: 3,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
});
