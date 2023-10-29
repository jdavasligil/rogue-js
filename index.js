const canvas = document.getElementById("game-canvas");
const text = document.getElementById("game-text");
const ctx = canvas.getContext("2d");
const canvas_width = 896;
const canvas_height = 504;
const seed = 12345;

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const rng = mulberry32(seed);

function roll(n,m) {
  total = 0
  for (let i = 0; i < n; i++) {
    total += Math.round(1 + rng() * (m - 1));
  }

  return total
}

function set_text(s) {
  text.innerText = s;
}
function append_text(s) {
  text.innerText += "\n\n" + s;
}
function write_description(s) {
  text.innerHTML += "<p style='color: yellow;'>" + s + "</p><br />";
}
function write_action(s) {
  text.innerHTML += "<p style='color: red;'>" + s + "</p><br />";
}
function clear_text() {
  text.innerHTML = "";
}

write_description("The green slime appears sentient. It smells terribly strong of ammonia.");
write_action("The slime attacks you!");

ctx.moveTo(0, 0);
ctx.lineTo(canvas_width, canvas_height);
ctx.strokeStyle = "white"
ctx.stroke();
