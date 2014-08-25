
var Genetic = require("../lib/genetic");
var assert = require("assert");


var genetic;

beforeEach(function () {
	genetic = Genetic.create();
});


describe("Config", function() {
	it("skip", function (done) {
		genetic.optimize = Genetic.Optimize.Maximize;
		genetic.select1 = Genetic.Select1.Tournament2;
		genetic.seed = function() {
			return 0;
		};
		genetic.mutate = function(entity) {
			return entity;
		};
		genetic.fitness = function(entity) {
			var fitness = 0;
			return entity;
		};
		
		var count = 0;
		genetic.notification = function(pop, generation, stats, isFinished) {
			
			if (!isFinished) {
				assert.equal(generation%10, 0);
			}
			
			if (isFinished) {
				assert.equal(count, 10);
				done();
			}
			
			++count;
		};
		var config = {
			"iterations": 100
			, "size": 30
			, "crossover": 0.0
			, "skip": 10
		};
		genetic.evolve(config, {"index": 0});
	});
});
