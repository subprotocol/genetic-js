(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

window.Genetic = require('./genetic');

},{"./genetic":2}],2:[function(require,module,exports){

var Genetic = Genetic || (function(){
	
	'use strict';
	
	// facilitates communcation between web workers
	var Serialization = {
		"stringify": function (obj) {
			return JSON.stringify(obj, function (key, value) {
				if (value instanceof Function || typeof value == "function") return "__func__:" + value.toString();
				if (value instanceof RegExp) return "__regex__:" + value;
				return value;
			});
		}, "parse": function (str) {
			return JSON.parse(str, function (key, value) {
				if (typeof value != "string") return value;
				if (value.lastIndexOf("__func__:", 0) === 0) return eval('(' + value.slice(9) + ')');
				if (value.lastIndexOf("__regex__:", 0) === 0) return eval('(' + value.slice(10) + ')');
				return value;
			});
		}
	};
	
	var Clone = function(obj) {
		if (obj == null || typeof obj != "object")
			return obj;
		
		return JSON.parse(JSON.stringify(obj));
	};
	
	var Optimize = {
		"Maximize": function (a, b) { return a >= b; }
		, "Minimize": function (a, b) { return a < b; }
	};
	
	var Select1 = {
		"Tournament2": function(pop) {
			var n = pop.length;
			var a = pop[Math.floor(Math.random()*n)];
			var b = pop[Math.floor(Math.random()*n)];
			return this.optimize(a.fitness, b.fitness) ? a.entity : b.entity;
		}, "Tournament3": function(pop) {
			var n = pop.length;
			var a = pop[Math.floor(Math.random()*n)];
			var b = pop[Math.floor(Math.random()*n)];
			var c = pop[Math.floor(Math.random()*n)];
			var best = this.optimize(a.fitness, b.fitness) ? a : b;
			best = this.optimize(best.fitness, c.fitness) ? best : c;
			return best.entity;
		}, "Fittest": function (pop) {
			return pop[0].entity;
		}, "Random": function (pop) {
			return pop[Math.floor(Math.random()*pop.length)].entity;
		}, "RandomLinearRank": function (pop) {
			this.internalGenState["rlr"] = this.internalGenState["rlr"]||0;
			return pop[Math.floor(Math.random()*Math.min(pop.length,(this.internalGenState["rlr"]++)))].entity;
		}, "Sequential": function (pop) {
			this.internalGenState["seq"] = this.internalGenState["seq"]||0;
			return pop[(this.internalGenState["seq"]++)%pop.length].entity;
		}
	};
	
	var Select2 = {
		"Tournament2": function(pop) {
			return [Select1.Tournament2.call(this, pop), Select1.Tournament2.call(this, pop)];
		}, "Tournament3": function(pop) {
			return [Select1.Tournament3.call(this, pop), Select1.Tournament3.call(this, pop)];
		}, "Random": function (pop) {
			return [Select1.Random.call(this, pop), Select1.Random.call(this, pop)];
		}, "RandomLinearRank": function (pop) {
			return [Select1.RandomLinearRank.call(this, pop), Select1.RandomLinearRank.call(this, pop)];
		}, "Sequential": function (pop) {
			return [Select1.Sequential.call(this, pop), Select1.Sequential.call(this, pop)];
		}, "FittestRandom": function (pop) {
			return [Select1.Fittest.call(this, pop), Select1.Random.call(this, pop)];
		}
	};
	
	function Genetic() {
		
		// population
		this.fitness = null;
		this.seed = null;
		this.mutate = null;
		this.crossover = null;
		this.select1 = null;
		this.select2 = null;
		this.optimize = null;
		this.generation = null;
		this.notification = null;
		
		this.configuration = {
			"size": 250
			, "crossover": 0.9
			, "mutation": 0.2
			, "iterations": 100
			, "fittestAlwaysSurvives": true
			, "maxResults": 100
			, "webWorkers": true
			, "skip": 0
		};
		
		this.userData = {};
		this.internalGenState = {};
		this.callerFunctions = {};
		
		this.entities = [];
		
		this.usingWebWorker = false;
		
		this.mapFitnessAsync = function(entities, callback) {
			var _this = this;

			var scores = [];
			var nbScores = 0;

			entities.forEach(function(entity, i) {

				var setScore = function(score) {
					scores[i] = score;
					nbScores += 1;
					if (nbScores === entities.length) {
						callback(scores);
					}
				};

				// Supports fitness function sync or async based on number of expected arguments
				if (_this.fitness.length === 1) {
					setScore(_this.fitness(entity));
				} else {
					_this.fitness(entity, setScore);
				}
			});
		};

		this.seriesAsync = function(nb, func) {
			var self = this;
			var results = [];

			var recursion = function(i) {
				if(i < nb) {
					func.call(self, i, function recursionCallback() {
						recursion(i + 1);
					});
				}
			};

			recursion(0);
		};

		this.start = function() {
			
			var self = this;
			
			// prepare wrapping around caller functions
			for(var k in this.callerFunctions) {
				this.callerFunctions[k] = this.wrapCallerFunction(k);
			}

			function mutateOrNot(entity) {
				// applies mutation based on mutation probability
				return Math.random() <= self.configuration.mutation && self.mutate ? self.mutate(Clone(entity)) : entity;
			}
			
			// seed the population
			for (var i=0;i<this.configuration.size;++i)  {
				this.entities.push(Clone(this.seed()));
			}
			
			this.seriesAsync(this.configuration.iterations, function runGeneration(i, generationCallback){
				// reset for each generation
				self.internalGenState = {};
				
				// Asynchronous score
				self.mapFitnessAsync(self.entities, function(scores){

					var pop = self.entities
						.map(function (entity, i) {
							return {"fitness": scores[i], "entity": entity };
						})
						.sort(function (a, b) {
							return self.optimize(a.fitness, b.fitness) ? -1 : 1;
						});
					
					// generation notification
					var mean = pop.reduce(function (a, b) { return a + b.fitness; }, 0)/pop.length;
					var stdev = Math.sqrt(pop
						.map(function (a) { return (a.fitness - mean) * (a.fitness - mean); })
						.reduce(function (a, b) { return a+b; }, 0)/pop.length);
						
					var stats = {
						"maximum": pop[0].fitness
						, "minimum": pop[pop.length-1].fitness
						, "mean": mean
						, "stdev": stdev
					};

					var r = self.generation ? self.generation(pop, i, stats) : true;
					var isFinished = (typeof r != "undefined" && !r) || (i == self.configuration.iterations-1);
					
					if (
						self.notification
						&& (isFinished || self.configuration["skip"] == 0 || i%self.configuration["skip"] == 0)
					) {
						self.sendNotification(pop.slice(0, self.maxResults), i, stats, isFinished);
					}
						
					if (isFinished)
						return;
					
					// crossover and mutate
					var newPop = [];
					
					if (self.configuration.fittestAlwaysSurvives) // lets the best solution fall through
						newPop.push(pop[0].entity);
					
					while (newPop.length < self.configuration.size) {
						if (
							self.crossover // if there is a crossover function
							&& Math.random() <= self.configuration.crossover // base crossover on specified probability
							&& newPop.length+1 < self.configuration.size // keeps us from going 1 over the max population size
						) {
							var parents = self.select2(pop);
							var children = self.crossover(Clone(parents[0]), Clone(parents[1])).map(mutateOrNot);
							newPop.push(children[0], children[1]);
						} else {
							newPop.push(mutateOrNot(self.select1(pop)));
						}
					}
					
					self.entities = newPop;

					generationCallback();
				});

			});		
		};
		
		this.callerFunctionsCallbacks = {};
		this.callbackId = 0;
		// In the context of a web work a callerFunction is wrapped in a postMessage/onmessage exchange
		this.wrapCallerFunction = function(funcName) {
			if (this.usingWebWorker) {
				// do not use 'self' keyword, here. Weird conflict when in non worker mode
				var _this = this;
				return function(){
					var args = Array.prototype.slice.call(arguments);
					// This id will be used to create request/reply mechanism
					_this.callerFunctionsCallbacks[_this.callbackId] = args.pop();
					postMessage({
						callerFunction: funcName,
						id: _this.callbackId,
						arguments: Serialization.stringify(args)
					});
					_this.callbackId += 1;
				};
			} else {
				// self declared outside of scope
				return self.callerFunctions[funcName];
			}
		};

		this.onmessage = function(e) {
			if (e.data && this.callerFunctionsCallbacks[e.data.id]) {
				this.callerFunctionsCallbacks[e.data.id].apply(this, Serialization.parse(e.data.arguments));
				delete this.callerFunctionsCallbacks[e.data.id];
			} else {
				this.start();
			}
		};

		this.sendNotification = function(pop, generation, stats, isFinished) {
			var response = {
				"pop": pop.map(Serialization.stringify)
				, "generation": generation
				, "stats": stats
				, "isFinished": isFinished
			};
			
			
			if (this.usingWebWorker) {
				postMessage(response);
			} else {
				// self declared outside of scope
				self.notification(response.pop.map(Serialization.parse), response.generation, response.stats, response.isFinished);
			}
			
		};
	}
	
	Genetic.prototype.evolve = function(config, userData, callerFunctions) {
		
		var k;
		for (k in config) {
			this.configuration[k] = config[k];
		}
		
		for (k in userData) {
			this.userData[k] = userData[k];
		}

		for (k in callerFunctions) {
			this.callerFunctions[k] = callerFunctions[k];
		}
		
		// determine if we can use webworkers
		this.usingWebWorker = this.configuration.webWorkers
			&& typeof Blob != "undefined"
			&& typeof Worker != "undefined"
			&& typeof window.URL != "undefined"
			&& typeof window.URL.createObjectURL != "undefined";
		
		function addslashes(str) {
			return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
		}
			
		// bootstrap webworker script
		var blobScript = "'use strict'\n";
		blobScript += "var Serialization = {'stringify': " + Serialization.stringify.toString() + ", 'parse': " + Serialization.parse.toString() + "};\n";
		blobScript += "var Clone = " + Clone.toString() + ";\n";
		
		// make available in webworker
		blobScript += "var Optimize = Serialization.parse(\"" + addslashes(Serialization.stringify(Optimize)) + "\");\n";
		blobScript += "var Select1 = Serialization.parse(\"" + addslashes(Serialization.stringify(Select1)) + "\");\n";
		blobScript += "var Select2 = Serialization.parse(\"" + addslashes(Serialization.stringify(Select2)) + "\");\n";
		
		// materialize our ga instance in the worker
		blobScript += "var genetic = Serialization.parse(\"" + addslashes(Serialization.stringify(this)) + "\");\n";
		blobScript += "onmessage = function(e) { genetic.onmessage(e); }\n";
		
		var self = this;
		
		if (this.usingWebWorker) {
			// webworker
			var blob = new Blob([blobScript]);
			var worker = new Worker(window.URL.createObjectURL(blob));
			worker.onmessage = function(e) {
			  var data = e.data;
			  if (data.callerFunction) {
			  	// receive a request from the work to run a function in caller context, do it then respond by postMessage
			  	self.callerFunctions[data.callerFunction].apply(self, Serialization.parse(data.arguments).concat(function(){
			  		var args = Array.prototype.slice.call(arguments);
			  		worker.postMessage({
			  			callerFunctionCallback: data.callerFunction,
			  			id: data.id,
			  			arguments: Serialization.stringify(args)
			  		});
			  	}));
			  } else {
			  	self.notification(data.pop.map(Serialization.parse), data.generation, data.stats, data.isFinished);
			  }
			};
			worker.onerror = function(e) {
				alert('ERROR: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
			};
			worker.postMessage("start");
		} else {
			// simulate webworker
			(function(){
				var onmessage;
				eval(blobScript);
				onmessage("start");
			})();
		}
	}
	
	return {
		"create": function() {
			return new Genetic();
		}, "Select1": Select1
		, "Select2": Select2
		, "Optimize": Optimize
		, "Clone": Clone
	};
	
})();


// so we don't have to build to run in the browser
if (typeof module != "undefined") {
	module.exports = Genetic;
}

},{}]},{},[1]);
