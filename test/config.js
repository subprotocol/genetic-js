
var Genetic = require("../lib/genetic");
var assert = require("assert");


var ga;

beforeEach(function () {
	ga = Genetic.create();
});


describe("Config", function() {
	it("skip", function (done) {
		ga.optimize = Genetic.Optimize.Maximize;
		ga.select1 = Genetic.Select1.Tournament2;
		ga.seed = function() {
			return 0;
		};
		ga.mutate = function(entity) {
			return entity;
		};
		ga.fitness = function(entity) {
			var fitness = 0;
			return entity;
		};
		
		var count = 0;
		ga.notification = function(pop, generation, stats, isFinished) {
			
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
		ga.evolve(config, {"index": 0});
	});
});
