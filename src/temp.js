let caps = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

let lower = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

for (let i = 0, str; i < caps.length; i++) {
  str += `{
      "msg": "Please choose the cursive lower case letter '${caps[i]}'.",
      "character": "${lower[i]}",
      "cursive": true,
      "check": "lcc-${lower[i]}"
    },`;
  if (i == lower.length - 1) {
    document.getElementById("test").style.color = "#fff";
    document.getElementById("test").innerHTML = str;
  }
}
