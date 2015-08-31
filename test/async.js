
if (typeof require === 'function') {
	var Genetic = require("../lib/genetic");
	var assert = require("assert");
}


var genetic;

beforeEach(function () {
	genetic = Genetic.create();
});


describe("Async", function() {
	it("fitness", function (done) {
		genetic.optimize = Genetic.Optimize.Maximize;
		genetic.select1 = Genetic.Select1.Tournament2;
		genetic.seed = function() {
			return 0;
		};
		genetic.mutate = function(entity) {
			return entity;
		};

		genetic.fitness = function(entity, callback) {
			this.internalGenState.val = this.internalGenState.val || 0;
			this.internalGenState.val += 1;
			var val = this.internalGenState.val;
			setTimeout(function(){
				callback(val);
			}, 1);
		};
		
		var count = 0;
		genetic.notification = function(pop, generation, stats, isFinished) {
			count++;
			if (isFinished) {
				assert.equal(count, 2);
				assert.equal(stats.maximum, 10);
				assert.equal(stats.mean, 5.5);
				done();
			}
		};
		var config = {
			"iterations": 2
			, "size": 10
			, "crossover": 0.0
			, "skip": 10
		};
		genetic.evolve(config);
	});

	it("caller function", function (done) {
		genetic.optimize = Genetic.Optimize.Maximize;
		genetic.select1 = Genetic.Select1.Tournament2;
		genetic.seed = function() {
			return 0;
		};
		genetic.mutate = function(entity) {
			return entity;
		};

		genetic.fitness = function(entity, callback) {
			this.callerFunctions.getCallerVar(callback);
		};
		
		var count = 0;
		genetic.notification = function(pop, generation, stats, isFinished) {
			if (isFinished) {
				assert.equal(stats.maximum, 10);
				assert.equal(stats.mean, 5.5);
				done();
			}
		};
		var config = {
			"iterations": 1
			, "size": 10
			, "crossover": 0.0
			, "skip": 1
		};

		var callerVar = 0;

		genetic.evolve(config, {}, {
			getCallerVar: function(callback){
				callerVar += 1;
				callback(callerVar);
			}
		});
	});
});