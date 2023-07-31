## System Architecture
> **_NOTE:_** This document contains mermaidJS charts, a version of this document rendered properly can be viewed at the link. https://github.com/ozzy-cox/coupon-management-system/blob/main/docs.md
```mermaid
flowchart TD
    Client(((User)))
    Gateway[/Gateway<br>Load Balancer\]
    Database[("Database")]
    Cache{"Cache"}
    CronWorker(("Cron<br>Worker")) --"Purges expired coupons"--> Database

    subgraph Server
    direction TB
        Service1["Service 1"]
        Service2["Service 2"]
        Service3["Service n"]
        UserService["User Service(s)"]
    end
    
    subgraph Workers
        direction TB
        Worker1(("Queue<br>Worker 1"))
        Worker2(("Queue<br>Worker 2"))
        Workern(("Queue<br>Worker n"))
        WorkerMega(("MEGADEAL<br>Worker"))
    end

    subgraph Queues
        direction TB
        Queue1{{"Queue 1"}}
        Queue2{{"Queue 2"}}
        Queuen{{"Queue n"}}
        QueueMega{{"MEGADEAL<br>Queue"}}
    end
    
    Client --> Gateway
    Gateway --> Server
    
    Server --"Redis is also used for coupon counts storage"--> Cache
    Server --> Database
    
    Server --> Queue1
    
    Server --"Send rate limited coupon requests to respective queue"--> Queue2
    Server --> Queuen
    Server --> QueueMega

    Queue1 --> Worker1
    Queue2 --> Worker2
    Queuen --> Workern
    QueueMega --> WorkerMega
    
    Worker1 <----> Cache
    Worker2 <----> Cache
    Workern <--"Results are written to cache"--> Cache
    WorkerMega <--"Redis is used for rate limiting"--> Cache
```
> If you can't view the diagrams, they are included in the source as flowchart.png and sequence.png

#### Assumptions
* Each coupon can be assigned to a single user.
* Requesting a coupon without a type will return the first coupon without a type.
* Requesting a coupon with a type will return the first coupon with a type.
* MEGADEAL
  * No more than 5 concurrent requests for megadeal will be processed.
  * Coupons can be requested a maximum of 10 times within a second. I interpreted this and the next statement saying users can wait up to 10 seconds for a megadeal coupon as users will be queued up to get this type of coupon and will have to wait up to 10 seconds, if the queue is longer than 10 seconds i.e there are 100 requests lined up. Remaining will be discarded.
```mermaid
    sequenceDiagram
    participant Client
    participant Server
    participant Queue
    participant Worker
    participant Cache
    
    Client ->> Server: Request to get a MEGADEAL coupon.
    alt there are too many people in the queue (>=100)
    Server ->> Client: Creates a task in queue to handle coupon request.
    else there are less than 10 seconds worth of requests (<100) in the queue
    Server ->> Queue: Creates a task in queue to handle coupon request.
    Queue ->> Server: Returns task id
    Server ->> Client: Returns task id to track the process of coupon request.
    end
    Queue ->> Worker: Takes tasks out of the queue as rate limiter allows.
    Worker ->> Cache: Save the task result to be collected.
    loop Linear backoff (1,2,3,4 seconds) 4 times, total of 10 seconds.
        Client ->> Server: Is the task done yet ? Sends id of task.
        Server ->> Cache: Is the task done yet ? with id.
        alt task is done
            Cache ->> Server: Done, return assigned coupon.
            Server ->> Client: Done, return assigned coupon.
        else task is waiting
            Cache ->> Server: Result for coupon allocation not found
            Server ->> Client: Task is not done yet, or will not be done.
        end
    end
```
* A cron job runs the purge coupons method with arbitrary frequency. (A week maybe)
* Count of total uploaded and redeemed coupons per coupon type are stored in redis.
* All operations are logged
* Coupons are persisted in a relational database, though repository pattern is used to allow for easy transition to other persistent storage providers.

#### Design Considerations

* App is made as a single js application for the sake of brevity.
* In order for it to be a single app without external dependencies, the necessary dependencies are either mocked or lightweight version of them are used.
  * SQLite for storage. (Instead of PostgreSQL)
  * ioredis-mock for process memory redis mocking. This is almost a fully functional redis mock in process memory.(Instead of a running redis instance)
  * Bee-queue is used for queueing tasks. (Instead of RabbitMQ etc.)
  * Queue workers are implemented using **worker_threads**. (Instead of seperate microservices)
  * Logs are written to file. (Instead of ElasticSearch, where some analysis could be made.)
  * Rate limiter and id generator is embedded in code, Ideally these would be seperate components to allow for better scalability, concurrency.
  * Load balancer/gateway was not implemented.

