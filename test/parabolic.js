var Genetic = require("../lib/genetic");
var assert = require("assert");


var genetic;

beforeEach(function () {
	genetic = Genetic.create();
	genetic.optimize = Genetic.Optimize.Minimize;
	genetic.seed = function() {
		
		var a = [];
		// create coefficients for polynomial with values between (-0.5, 0.5)
		
		var i;
		for (i=0;i<this.userData["terms"];++i) {
			a.push(Math.random()-0.5);
		}
		
		return a;
	};
	genetic.mutate = function(entity) {
		
		// allow chromosomal drift with this range (-0.05, 0.05)
		var drift = ((Math.random()-0.5)*2)*0.05;
		
		var i = Math.floor(Math.random()*entity.length);
		entity[i] += drift;
		
		return entity;
	};
	genetic.crossover = function(mother, father) {

		// crossover via interpolation
		function lerp(a, b, p) {
			return a + (b-a)*p;
		}
		
		var len = mother.length;
		var i = Math.floor(Math.random()*len);
		var r = Math.random();
		var son = [].concat(father);
		var daughter = [].concat(mother);
		
		son[i] = lerp(father[i], mother[i], r);
		daughter[i] = lerp(mother[i], father[i], r);
		
		return [son, daughter];
	};
	genetic.fitness = function(entity) {
		
		function evaluatePoly(x) {
			var s = 0;
			var p = 1;
			var i;
			for (i=0;i<entity.length;++i) {
				s += p*entity[i];
				p *= x;
			}
			 
			return s;
		}

		var sumSqErr = 0;
		var m = 1;
		var step = m/this.userData["resolution"];
		var x;
		for (x=0;x<m;x+=step) {
			var err = evaluatePoly(x) - (x*x);
			sumSqErr += err*err;
		}
		
		return Math.sqrt(sumSqErr);
	};
	genetic.generation = function(pop, generation, stats) {
		return pop[0].fitness > 0.04;
	};
});


function solveTest(sel1, sel2, config) {
	it(sel1 + ", " + sel2, function (done) {
		genetic.select1 = eval(sel1);
		genetic.select2 = eval(sel2);
		
		var gen0fitness;
		genetic.notification = function(pop, generation, stats, isFinished) {
			if (generation == 0) {
				gen0fitness = pop[0].fitness;
			}
			
			if (isFinished) {
				assert.equal(pop[0].fitness <= gen0fitness, true);
				assert.equal(pop[0].fitness <= 0.04, true);
				done();
			}
		};
	
		var userData = {
			"terms": 3
			, "resolution": 3
		};
	
		genetic.evolve(config, userData);
	});
}

describe("Genetic Parabolic Solver", function() {
	
	var config = {
		"iterations": 1000
		, "size": 20
		, "crossover": 0.3
		, "mutation": 1.0
	};
	
	
	var k;
	for (k in Genetic.Select1) {
		for (j in Genetic.Select2) {
			solveTest("Genetic.Select1."+k, "Genetic.Select2."+j, config);
		}
	};
	
});