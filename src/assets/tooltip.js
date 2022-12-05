import * as IDB from "idb-keyval";
import introJs from "intro.js";
const log = console.log.bind(console);

function init() {
  IDB.get("runTutorial")
    .then((val) => {
      // check the IndexedDb to see if the app is installed
      if (val == undefined) {
        introJs()
          .setOptions({
            showButtons: true,
            showBullets: false,
            showStepNumbers: true,
            showProgress: false,
            disableInteraction: true,
            steps: [
              {
                title: "Welcome",
                intro: "Welcome to Kara's Letters!",
              },
              {
                title: "Start",
                element: document.querySelector("#speakBtn"),
                intro: "Tap to hear the question",
              },
              {
                element: document.querySelector(".userChoice:nth-child(1)"),
                intro: "Choose an answer",
              },
              {
                element: document.querySelector("#speakBtn"),
                intro: "Rinse and Repeat...",
              },
              {
                title: "Settings & Users",
                element: document.querySelector("#openModal"),
                intro:
                  "Check out the game settings and manage users for this device.",
              },
            ],
          })
          .start();
      }
    })
    .then(() => {
      IDB.set("runTutorial", false);
    });
}

export { init };
