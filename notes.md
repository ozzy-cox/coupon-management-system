### Things to mention in docs
1. Choice of UUID, what can be done better ?
   1. For systems with higher concurrency, a global unique ID solution can be applied.
1. Rate limiter implemented in the code, ideally should be a seperate system component.


#### TODO
1. Create runners for processes
1. Create cron runner for removal of expired nodes (every week)
1. Populate controllers
1. MEGADEAL impl
1. How to run guide
1. Run cron task for removing unused coupons periodically.

1. Change the logger to log to a file instead of console !!
1. Log batching
1. Add middleware logger for all endpoints