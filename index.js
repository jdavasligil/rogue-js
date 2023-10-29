var canvas = document.getElementById("game-canvas");
var text = document.getElementById("game-text");
var ctx = canvas.getContext("2d");
var canvas_width = 896;
var canvas_height = 504;

function update_text(s) {
  text.innerText = s
}

update_text("Rhoncus aenean vel elit scelerisque. Nec feugiat in fermentum posuere urna nec tincidunt praesent semper. Malesuada fames ac turpis egestas maecenas pharetra. Diam in arcu cursus euismod quis viverra nibh cras pulvinar. Sit amet luctus venenatis lectus magna fringilla. Ante metus dictum at tempor commodo. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Purus ut faucibus pulvinar elementum integer enim neque. Tincidunt nunc pulvinar sapien et ligula. Viverra justo nec ultrices dui sapien eget mi proin. Tellus pellentesque eu tincidunt tortor aliquam. Nisl suscipit adipiscing bibendum est. Ultrices neque ornare aenean euismod elementum. At varius vel pharetra vel turpis nunc eget. Faucibus scelerisque eleifend donec pretium vulputate sapien nec. Porta non pulvinar neque laoreet. Viverra vitae congue eu consequat ac felis donec. Velit euismod in pellentesque massa placerat duis ultricies. Amet consectetur adipiscing elit duis tristique sollicitudin nibh sit. Facilisi morbi tempus iaculis urna id. A erat nam at lectus urna duis convallis. Non odio euismod lacinia at quis risus sed vulputate. Nisi porta lorem mollis aliquam ut porttitor. Diam phasellus vestibulum lorem sed risus ultricies tristique nulla. Eget gravida cum sociis natoque penatibus. Diam ut venenatis tellus in. Suspendisse sed nisi lacus sed viverra tellus. Proin libero nunc consequat interdum. Auctor urna nunc id cursus metus aliquam. Vulputate enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Lectus sit amet est placerat in. Ultrices sagittis orci a scelerisque purus semper eget duis at. Ultricies integer quis auctor elit. Id volutpat lacus laoreet non curabitur gravida arcu. Risus at ultrices mi tempus imperdiet nulla malesuada. Pharetra et ultrices neque ornare aenean euismod elementum nisi quis. Aliquam purus sit amet luctus venenatis lectus magna fringilla urna. Ultrices dui sapien eget mi proin sed libero enim. Ac tortor dignissim convallis aenean et tortor at risus viverra.")
ctx.moveTo(0, 0);
ctx.lineTo(canvas_width, canvas_height);
ctx.stroke();
