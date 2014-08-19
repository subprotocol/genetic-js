# genetic-js

Genetic algorithm library

## Building
* make
* make test
* make clean
* make distclean

## Configuration Parameters

| Parameter             | Default  | Range/Type  | Description
| --------------------- | -------- | ----------  | -----------
| size                  | 250      | Real Number | Population size
| crossover             | 0.9      | [0.0, 1.0]  | Probability of crossover
| mutation              | 0.2      | [0.0, 1.0]  | Probability of mutation
| iterations            | 100      | Real Number | Maximum number of iterations before finishing
| fittestAlwaysSurvives | true     | Boolean     | Prevents losing the best fit between generations
| maxResults            | 100      | Real Number | The maximum number of best-fit results that webworkers will send per notification
| webWorkers            | true     | Boolean     | Use [Web Workers](http://en.wikipedia.org/wiki/Web_worker) (if available)
