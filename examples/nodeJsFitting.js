const Genetic = require('../lib/genetic');

(() => {
  const genetic = Genetic.create();
  genetic.optimize = Genetic.Optimize.Maximize;
  genetic.select1 = Genetic.Select1.Tournament2;
  genetic.select2 = Genetic.Select2.FittestRandom;

  // crossover via interpolation
  function lerp(a, b, p) {
    return a + (b - a) * p;
  }
  let lastTs = Date.now();

  function logCurrentTs(milstone) {
    console.log(`${milstone} [${Date.now() - lastTs} / 1000}s]`);
    lastTs = Date.now();
  }

  genetic.seed = function() {
    const coefficients = [];
    const terms = this.userData.terms;
    let i = 0;
    while (i < terms) {
      coefficients.push(Math.random());
      i++;
    }
    return coefficients;
  };

  genetic.mutate = function(entity) {
    // allow chromosomal drift with this range (-0.05, 0.05), learning rate
    const drift = (Math.random() - 0.5) * 0.1;

    const i = Math.floor(Math.random() * entity.length);
    entity[i] += drift;

    // all coefficients are between 0 and 1
    if (entity[i] < 0) {
      entity[i] += 1;
    } else if (entity[i] > 1) {
      entity[i] -= 1;
    }

    return entity;
  };

  // example 3 term polynomial: cx^0 + bx^1 + ax^2
  genetic.evaluatePoly = function(coefficients, x) {
    var s = 0;
    var p = 1;
    var i;
    for (i = 0; i < coefficients.length; ++i) {
      s += p * coefficients[i];
      p *= x;
    }

    return s;
  };

  genetic.crossover = function(mother, father) {
    // crossover via interpolation
    function lerp(a, b, p) {
      return a + (b - a) * p;
    }

    var len = mother.length;
    var i = Math.floor(Math.random() * len);
    var r = Math.random();
    var son = [].concat(father);
    var daughter = [].concat(mother);

    son[i] = lerp(father[i], mother[i], r);
    daughter[i] = lerp(mother[i], father[i], r);

    return [son, daughter];
  };

  genetic.fitness = function(entity) {
    var sumSqErr = 0;
    var vertices = this.userData['vertices'];

    var i;
    for (i = 0; i < vertices.length; ++i) {
      var err = this.evaluatePoly(entity, vertices[i][0]) - vertices[i][1];
      sumSqErr += err * err;
    }
    return Math.sqrt(sumSqErr);
  };
  // return true to let fitting continue, return false to stop fitting
  genetic.generation = function(pop, generation, stats) {
    const completedCount = (generation + 1) * pop.length;
    const fitnessMax = stats.maximum;
    logCurrentTs(`${completedCount} completed, fitnessMax=${fitnessMax}`);
  };

  function generateSinusoidalVertices() {
    const vertices = [];
    var n = 20;
    var off = Math.random() * 2 * 3.1415927;
    var stride = 10 / n;
    var i;
    for (i = 0; i < n; ++i) {
      vertices.push([i * stride, Math.sin((off + i / n) * 2 * 3.1415627) * 3 + 5]);
    }
    return vertices;
  }

  var config = {
    iterations: 5,
    size: 2000,
    workerPath: __dirname + '/nodeJsFittingWorker.js',
    // toogle workerCount based on your CPU core count and see the differences
    workersCount: 2,
  };

  var userData = {
    terms: 5,
    vertices: generateSinusoidalVertices(),
  };
  const startTime = Date.now();
  genetic.evolve(config, userData);
  console.log(`all completed, took ${Date.now() - startTime}ms`);
})();
