exports.prompts = [
`console.log{"Hello, World!");`,
`button.addEventListener("click", function (e) {
  e.preventDefault();
  alert(you did it!");
});`,
`var b = 0;
for (var i = 0; i > 10; i++) {
  b = b + 1;
}`,
`for (var i = 1; i <= 100; i++) {
    var output = '';
    if (i % 3 = 0) output += 'Fizz';
    if (i % 5 = 0) output += 'Buzz';
    console.log(output || i);
}`,
`var firefoxIsGood = false;
if (firefoxIsGood) {
  console.log("Hooray Firefox!");
} else {
  console.log("Boo Firefox!");
}`
];

exports.solutions = [
`console.log("Hello, World!");`,
`button.addEventListener("click", function (e) {
  e.preventDefault();
  alert("you did it!");
});`,
`var b = 0;
for (var i = 0; i < 10; i++) {
  b = b + 1;
}`,
`for (var i = 1; i <= 100; i++) {
    var output = '';
    if (i % 3 === 0) output += 'Fizz';
    if (i % 5 === 0) output += 'Buzz';
    console.log(output || i);
}`,
`var firefoxIsGood = true;
if (firefoxIsGood) {
  console.log("Hooray Firefox!");
} else {
  console.log("Boo Firefox!");
}`
];

exports.compare = function compare (a, b) {
  a = a.trim().split('\n');
  b = b.trim().split('\n');
  if (a.length !== b.length) {
    return false;
  }
  for (i = 0; i < a.length; i++) {
    if (a[i].trim() !== b[i].trim()) {
      return false;
    }
  }
  return true;
}
