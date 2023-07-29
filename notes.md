### Things to mention in docs
1. Choice of UUID, what can be done better ?
   1. For systems with higher concurrency, a global unique ID solution can be applied.
1. Rate limiter implemented in the code, ideally should be a seperate system component.


#### TODO
1. Test runners for processes
2. Populate controllers

3. MEGADEAL impl
   1. Save result to redis with expiration
   2. Create endpoint for collecting created coupons
4. How to run guide

6. Change the logger to log to a file instead of console !!
7. Log batching
8. Add middleware logger for all endpoints