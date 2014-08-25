
var Genetic = require("../lib/genetic");
var assert = require("assert");


var genetic;

beforeEach(function () {
	genetic = Genetic.create();
});

describe("Clone", function() {
	
	it("Array", function () {
		var a1 = [];
		a1.push([1, 2]);
		
		var a2 = a1;
		a2.push("test");
		
		var a3 = Genetic.Clone(a2);
		
		assert.equal(a1.length, 2);
		assert.equal(a2.length, 2);
		assert.equal(a3.length, 2);
		
		a2[0] = "overwritten";
		assert.equal(a1[0], "overwritten");
		assert.equal(a2[0], "overwritten");
		assert.equal(a3[0].join(), [1, 2].join());
	});
	
	it("Object", function () {
		var obj1 = {};
		obj1["a"] = true;
		var obj2 = obj1;
		var obj3 = Genetic.Clone(obj2);
		obj2["b"] = false;
		assert.equal("b" in obj1, true);
		assert.equal("a" in obj3, true);
		assert.equal("b" in obj3, false);
	});
	
	
});


describe("Optimize", function() {
	
	it("Minimize", function () {
		assert.equal(Genetic.Optimize.Minimize(1,2), true);
		assert.equal(Genetic.Optimize.Minimize(2,1), false);
		assert.equal(Genetic.Optimize.Minimize(2,2), false);
	});
	
	it("Maximize", function () {
		assert.equal(Genetic.Optimize.Maximize(1,2), false);
		assert.equal(Genetic.Optimize.Maximize(2,1), true);
		assert.equal(Genetic.Optimize.Maximize(2,2), true);
	});
	
});

describe("Selection", function() {
	
	it("Tournament2", function (done) {
		genetic.optimize = Genetic.Optimize.Minimize;
		genetic.select1 = Genetic.Select1.Tournament2;
		genetic.select2 = Genetic.Select2.Tournament2;
		genetic.crossover = function(mother, father) {
			return [mother, father];
		};
		genetic.seed = function() {
			return this.userData["index"]++;
		};
		genetic.fitness = function(entity) {
			return entity;
		};
		genetic.notification = function(pop, generation, stats, isFinished) {
			assert.equal(pop.length, 30);
			
			// validate ordering
			var i;
			for (i=1;i<pop.length;++i) {
				assert.equal(pop[i-1].fitness <= pop[i].fitness, true);
			}

			if (generation == 0) {
				assert.equal(pop[0].entity, 0);
				assert.equal(pop[1].entity, 1);
			}
			
			if (isFinished) {
				done();
			}
		};
		var config = {
			"iterations": 50
			, "size": 30
			, "crossover": 1.0
			, "fittestAlwaysSurvives": false
		};
		genetic.evolve(config, {"index": 0});
	});
	
	it("Tournament3", function (done) {
		genetic.optimize = Genetic.Optimize.Maximize;
		genetic.select1 = Genetic.Select1.Tournament3;
		genetic.select2 = Genetic.Select2.Tournament3;
		genetic.crossover = function(mother, father) {
			return [mother, father];
		};
		genetic.seed = function() {
			return this.userData["index"]++;
		};
		genetic.fitness = function(entity) {
			return entity;
		};
		genetic.notification = function(pop, generation, stats, isFinished) {
			assert.equal(pop.length, 30);
			
			// validate ordering
			var i;
			for (i=1;i<pop.length;++i) {
				assert.equal(pop[i-1].fitness >= pop[i].fitness, true);
			}

			if (isFinished) {
				done();
			}
		};
		var config = {
			"iterations": 50
			, "size": 30
			, "crossover": 1.0
			, "fittestAlwaysSurvives": false
		};
		genetic.evolve(config, {"index": 0});
	});
	
	it("Random", function (done) {
		genetic.optimize = Genetic.Optimize.Maximize;
		genetic.select1 = Genetic.Select1.Random;
		genetic.select2 = Genetic.Select2.Random;
		genetic.crossover = function(mother, father) {
			return [mother, father];
		};
		genetic.seed = function() {
			return this.userData["index"]++;
		};
		genetic.fitness = function(entity) {
			return entity;
		};
		genetic.notification = function(pop, generation, stats, isFinished) {
			assert.equal(pop.length, 30);
			
			// validate ordering
			var i;
			for (i=1;i<pop.length;++i) {
				assert.equal(pop[i-1].fitness >= pop[i].fitness, true);
			}
			
			if (isFinished) {
				done();
			}
		};
		var config = {
			"iterations": 50
			, "size": 30
			, "crossover": 1.0
			, "fittestAlwaysSurvives": false
		};
		genetic.evolve(config, {"index": 0});
	});
	
	it("RandomLinearRank", function (done) {
		genetic.optimize = Genetic.Optimize.Minimize;
		genetic.select1 = Genetic.Select1.RandomLinearRank;
		genetic.select2 = Genetic.Select2.RandomLinearRank;
		genetic.crossover = function(mother, father) {
			return [mother, father];
		};
		genetic.seed = function() {
			return this.userData["index"]++;
		};
		genetic.fitness = function(entity) {
			return entity;
		};
		genetic.notification = function(pop, generation, stats, isFinished) {
			assert.equal(pop.length, 30);
			
			// validate ordering
			var i;
			for (i=1;i<pop.length;++i) {
				assert.equal(pop[i-1].fitness <= pop[i].fitness, true);
			}
			
			if (isFinished) {
				assert.equal(pop[0].entity, 0);
				done();
			}
		};
		var config = {
			"iterations": 50
			, "size": 30
			, "crossover": 1.0
			, "fittestAlwaysSurvives": false
		};
		genetic.evolve(config, {"index": 0});
	});
	
	it("FittestRandom", function (done) {
		genetic.optimize = Genetic.Optimize.Maximize;
		genetic.select1 = Genetic.Select1.RandomLinearRank;
		genetic.select2 = Genetic.Select2.FittestRandom;
		genetic.crossover = function(mother, father) {
			return [mother, father];
		};
		genetic.seed = function() {
			return this.userData["index"]++;
		};
		genetic.fitness = function(entity) {
			return entity;
		};
		genetic.notification = function(pop, generation, stats, isFinished) {
			assert.equal(pop.length, 30);
			
			// validate ordering
			var i;
			for (i=1;i<pop.length;++i) {
				assert.equal(pop[i-1].fitness >= pop[i].fitness, true);
			}

			// should always return the largest
			assert.equal(pop[0].entity, pop.length-1);

			if (isFinished) {
				done();
			}
		};
		var config = {
			"iterations": 50
			, "size": 30
			, "crossover": 1.0
			, "fittestAlwaysSurvives": false
		};
		genetic.evolve(config, {"index": 0});
	});
	
	it("Sequential", function (done) {
		genetic.optimize = Genetic.Optimize.Maximize;
		genetic.select1 = Genetic.Select1.Sequential;
		genetic.select2 = Genetic.Select2.Sequential;
		genetic.crossover = function(mother, father) {
			return [genetic.optimize(mother, father) ? mother : father, genetic.optimize(mother, father) ? mother : father];
		};
		genetic.seed = function() {
			return this.userData["index"]++;
		};
		genetic.fitness = function(entity) {
			return entity;
		};
		genetic.notification = function(pop, generation, stats, isFinished) {
			assert.equal(pop.length, 30);
			
			// validate ordering
			var i;
			for (i=1;i<pop.length;++i) {
				assert.equal(pop[i-1].fitness >= pop[i].fitness, true);
			}
			
			if (isFinished) {
				for (i=1;i<pop.length;i+=2) {
					assert.equal(pop[i-1].fitness == pop[i].fitness, true);
				}
				
				for (i=0;i<pop.length;++i) {
					// should only see odd values
					assert.equal(pop[i].fitness%2, 1);
				}
				
				done();
			}
		};
		var config = {
			"iterations": 50
			, "size": 30
			, "crossover": 1.0
			, "fittestAlwaysSurvives": false
		};
		genetic.evolve(config, {"index": 0});
	});

});

