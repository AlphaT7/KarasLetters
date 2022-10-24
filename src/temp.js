for (let i = 0, str; i < 101; i++) {
  str += `{
      "msg": "Please choose the number '${i}'.",
      "character": ${i},
      "cursive": false,
      "check": "num-${i}"
    },`;
  if (i == 100) {
    document.getElementById("test").style.color = "#fff";
    document.getElementById("test").innerHTML = str;
  }
}
