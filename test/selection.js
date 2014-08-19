
var Genetic = require("../lib/genetic");
var assert = require("assert");


var ga;

beforeEach(function () {
	ga = Genetic.create();
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
	
	it("Tournament 1", function (done) {
		ga.optimize = Genetic.Optimize.Maximize;
		ga.select1 = Genetic.Select1.Tournament;
		ga.seed = function() {
			return this.userData["index"]++;
		};
		ga.fitness = function(entity) {
			return entity;
		};
		ga.notification = function(pop, generation, stats, isFinished) {
			assert.equal(pop.length, 2);
			assert.equal(pop[0].entity, 1);
			assert.equal(pop[1].entity, 0);
			var entity = this.select1(pop);
			assert.equal(entity == 0 || entity == 1, true);
			if (isFinished) {
				done();
			}
		};
		ga.evolve({"iterations": 1, "size": 2}, {"index": 0});
	});
	
	it("Tournament 2", function (done) {
		ga.optimize = Genetic.Optimize.Minimize;
		ga.select1 = Genetic.Select1.Tournament;
		ga.select2 = Genetic.Select2.Tournament;
		ga.crossover = function(mother, father) {
			return [mother, father];
		};
		ga.seed = function() {
			return this.userData["index"]++;
		};
		ga.fitness = function(entity) {
			return entity;
		};
		ga.notification = function(pop, generation, stats, isFinished) {
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
		ga.evolve(config, {"index": 0});
	});
	
	it("Fittest 1", function (done) {
		ga.optimize = Genetic.Optimize.Maximize;
		ga.select1 = Genetic.Select1.Fittest;
		ga.select2 = Genetic.Select2.Fittest;
		ga.crossover = function(mother, father) {
			return [mother, father];
		};
		ga.seed = function() {
			return this.userData["index"]++;
		};
		ga.fitness = function(entity) {
			return entity;
		};
		ga.notification = function(pop, generation, stats, isFinished) {
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
		ga.evolve(config, {"index": 0});
	});
	
	it("Random 1", function (done) {
		ga.optimize = Genetic.Optimize.Maximize;
		ga.select1 = Genetic.Select1.Random;
		ga.select2 = Genetic.Select2.Random;
		ga.crossover = function(mother, father) {
			return [mother, father];
		};
		ga.seed = function() {
			return this.userData["index"]++;
		};
		ga.fitness = function(entity) {
			return entity;
		};
		ga.notification = function(pop, generation, stats, isFinished) {
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
		ga.evolve(config, {"index": 0});
	});

});

