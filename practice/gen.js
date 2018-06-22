var gen = function* (n) {
  for(var i=0;i<3;i++) {
    n++;
    yield n;
  }
}

var genObj = gen(2);
console.log(genObj.next());
console.log(genObj.next());
console.log(genObj.next());
console.log(genObj.next());

var a = [1,2,3,4,5]

var b = a.filter((item)=> {
  return item > 2
});
console.log(b)