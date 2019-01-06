const evaluatePoly = function(coefficients, x) {
  var s = 0;
  var p = 1;
  var i;
  for (i=0;i<coefficients.length;++i) {
    s += p*coefficients[i];
    p *= x;
  }

  return s;
}
const fitness = function(entity, userData) {
  var sumSqErr = 0;
  var vertices = userData["vertices"];

  var i;
  for (i=0;i<vertices.length;++i) {
    var err = evaluatePoly(entity, vertices[i][0]) - vertices[i][1];
    sumSqErr += err*err;
  }

  return Math.sqrt(sumSqErr);
};

process.on('message', (msg) => {
  const { instruction, data } = msg;
  if (instruction === 'start') {
    const { entities, userData } = data;
    const fitnesses = entities.map((entity) => {
      return fitness(entity, userData);
    });

    if (typeof process.send === 'function') {
      process.send({ fitnesses });
      process.exit(0);
    }
  }
});
