# genetic-js

Advanced genetic and evolutionary algorithm library written in Javascript by [Sub Protocol](http://subprotocol.com/).


#### Rational

The existing Javascript GA/EP library landscape could collectively be summed up as, meh. All that I required to take over the world was a lightweight, performant, feature-rich, nodejs + browser compatible, unit tested, and easily hackable GA/EP library.  Seamless [Web Worker](http://en.wikipedia.org/wiki/Web_worker) support would be the icing on my cake.

Until now, no such thing existed. Now you can have my cake, and optimize it too. Is it perfect? *Probably*. Regardless, this library is my gift to you.

Have fun optimizing all your optimizations!


#### Examples

* [Genetic Phrase Solver](http://subprotocol.com/system/genetic-hello-world.html)
* [Genetic Curve Fitter](http://subprotocol.com/system/genetic-regression-curve.html)


#### Install

```npm install genetic-js```


## Population Functions

The genetic-js interface exposes a few simple concepts and primitives, you just fill in the details/features you want to use.
		
| Function                                  | Return Type              | Required   | Description
| ----------------------------------------- | ------------------------ | ---------- | -----------
| seed()                                    | Individual               | Yes        | Called to create an individual, can be of any type (int, float, string, array, object)
| fitness(individual)                       | Float                    | Yes        | Computes a fitness score for an individual
| mutate(individual)                        | Individual               | Optional   | Called when an individual has been selected for mutation
| crossover(mother, father)                 | [Son, Daughter]          | Optional   | Called when two individuals are selected for mating. Two children should always returned
| optimize(fitness, fitness)                | Boolean                  | Yes        | Determines if the first fitness score is better than the second. See [Optimizer](#optimizer) section below
| select1(population)                       | Individual               | Yes        | See [Selection](#selection) section below
| select2(population)                       | Individual               | Optional   | Selects a pair of individuals from a population. [Selection](#selection)
| generation(pop, gen, stats)               | Boolean                  | Optional   | Called for each generation.  Return false to terminate end algorithm (ie- if goal state is reached)
| notification(pop, gen, stats, isFinished) | Void                     | Optional   | Runs in the calling context. All functions other than this one are run in a web worker.


## Optimizer

The optimizer specifies how to rank individuals against each other based on an arbitrary fitness score.  For example, minimizing the sum of squared error for a regression curve `Genetic.Optimize.Minimize` would be used, as a smaller fitness score is indicative of better fit.

| Optimizer                  | Description
| -------------------------- | -----------
| Genetic.Optimize.Minimizer | The smaller fitness score of two individuals is best
| Genetic.Optimize.Maximizer | The greater fitness score of two individuals is best


## Selection

An algorithm can be either genetic or evolutionary depending on which selection operations are used.  An algorithm is evolutionary if it only uses a Single (select1) operator.  If both Single and Pair-wise operations are used (and if crossover is implemented) it is genetic.


| Select Type         | Required    | Description
| ------------------- | ----------- | -----------
| select1 (Single)    | Yes         | Selects a single individual for survival from a population
| select2 (Pair-wise) | Optional    | Selects two individuals from a population for mating/crossover


### Selection Operators

| Single Selectors                 | Description
| -------------------------------- | -----------
| Genetic.Select1.Tournament2      | Fittest of two random individuals
| Genetic.Select1.Tournament3      | Fittest of three random individuals
| Genetic.Select1.Fittest          | Always selects the Fittest individual
| Genetic.Select1.Random           | Randomly selects an individual
| Genetic.Select1.RandomLinearRank | Select random individual where probability is a linear function of rank
| Genetic.Select1.Sequential       | Sequentially selects an individual

| Pair-wise Selectors              | Description
| -------------------------------- | -----------
| Genetic.Select2.Tournament2      | Pairs two individuals, each the best from a random pair
| Genetic.Select2.Tournament3      | Pairs two individuals, each the best from a random triplett
| Genetic.Select2.Random           | Randomly pairs two individuals
| Genetic.Select2.RandomLinearRank | Pairs two individuals, each randomly selected from a linear rank
| Genetic.Select2.Sequential       | Selects adjacent pairs
| Genetic.Select2.FittestRandom    | Pairs the most fit individual with random individuals


```javascript
var genetic = Genetic.create();

// more likely allows the most fit individuals to survive between generations
genetic.select1 = Genetic.Select1.RandomLinearRank;

// always mates the most fit individual with random individuals
genetic.select2 = Genetic.Select2.FittestRandom;

// ...
```

## Configuration Parameters

| Parameter             | Default  | Range/Type  | Description
| --------------------- | -------- | ----------  | -----------
| size                  | 250      | Real Number | Population size
| crossover             | 0.9      | [0.0, 1.0]  | Probability of crossover
| mutation              | 0.2      | [0.0, 1.0]  | Probability of mutation
| iterations            | 100      | Real Number | Maximum number of iterations before finishing
| fittestAlwaysSurvives | true     | Boolean     | Prevents losing the best fit between generations
| maxResults            | 100      | Real Number | The maximum number of best-fit results that webworkers will send per notification
| webWorkers            | true     | Boolean     | Use [Web Workers](http://en.wikipedia.org/wiki/Web_worker) (when available)
| skip                  | 0        | Real Number | Setting this higher throttles back how frequently `genetic.notification` gets called in the main thread.


## Building

To clone, build, and test Genetic.js issue the following command:

```bash
git clone git@github.com:subprotocol/genetic-js.git && make distcheck
```

| Command               | Description
| --------------------- | -----------
| make                  | Automatically install dev-dependencies, builds project, places library to js/ folder
| make check            | Runs test cases
| make clean            | Removes files from js/ library
| make distclean        | Removes both files from js/ library and dev-dependencies
| make distcheck        | Equivlant to running `make distclean && make && check`


## Contributing

Feel free to open issues and send pull-requests.

