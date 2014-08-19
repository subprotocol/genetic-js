# genetic-js

Advanced genetic and evolutionary algorithm library written in Javascript by [Subprotocol](http://subprotocol.com/).  Works with nodejs and in the browser. Web workers are used when available!


## Optimizer

The optimizer specifies how to rank individuals against each other based on an arbitrary fitness score.  For example, minimizing the sum of squared error for a regression curve `Genetic.Optimize.Minimize` would be used, as a smaller fitness score is indicative of better fit.

| Optimizer                  | Description
| -------------------------- | -----------
| Genetic.Optimize.Minimizer | The smaller fitness score of two individuals is best
| Genetic.Optimize.Maximizer | The greater fitness score of two individuals is best


## Selection

An algorithm can be either genetic or evolutionary depending on which selection operations are used.  Algorithm is evolutionary if it only use a Single (select1) operator¸  If both Single and Pair-wise operations are used (and if crossover is implemented) it is genetic.


| Select Type         | Required?   | Description
| ------------------- | ----------- | -----------
| select1 (Single)    | Yes         | Selects a single individual for survival from a population.
| select2 (Pair-wise) | No          | Selects two individuals from a population for mate selection and genetic crossover.


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
var ga = Genetic.create();

// more likely allows the most fit individuals to survive between generations
ga.select1 = Genetic.Select1.RandomLinearRank;

// always mates the most fit individual with random individuals
ga.select2 = Genetic.Select2.FittestRandom;

// ...
```

## Population Operators

TODO: add


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


## Building
* make
* make test
* make clean
* make distclean


