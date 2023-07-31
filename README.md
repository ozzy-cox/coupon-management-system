### How to
A built version of the project is included in the zip file inside **dist** directory
```
To run:
    node dist/index.js

To build:
    npm run build
    or
    pnpm build

To run tests:
    npm test
    or
    pnpm test
    
To lint:
    npm run lint
    or
    pnpm lint
    
To test types:
    npm run tstest
    or
    pnpm tstest
```

#### API

##### ~Upload~
```
POST /upload HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Content-Length: 266

{
    "coupons": [
        {
            "couponCode": "1",
            "couponType": "STANDARD",
            "discountAmount": 20,
            "discountType": "FLAT",
            "expiryDate": "2023-07-31T05:10:51.480Z",
            "maxUsages": 1
        }
    ]
}
```
returns
```
{
    "coupons": {
        "1": {
            "id": "635b7771-c4a7-467d-a9ab-2e45836181b6",
            "createdAt": "2023-07-31T05:11:12.277Z",
            "couponCode": "1",
            "couponType": "STANDARD",
            "discountAmount": 20,
            "discountType": "FLAT",
            "expiryDate": "2023-07-31T05:10:51.480Z",
            "maxUsages": 1
        }
    }
}
```

##### ~RequestNewCoupon~

```
GET /request-new?userId=user1&couponType=STANDARD HTTP/1.1
Host: localhost:8000
```
returns
```
{
    "data": {
        "id": "9037b596-684d-4600-af4c-c9a677a3df2f",
        "createdAt": "2023-07-31T05:16:19.997Z",
        "usages": 0,
        "userId": "user1",
        "coupon": {
            "id": "635b7771-c4a7-467d-a9ab-2e45836181b6",
            "createdAt": "2023-07-31T05:11:12.277Z",
            "couponCode": "1",
            "couponType": "STANDARD",
            "discountAmount": 20,
            "discountType": "FLAT",
            "expiryDate": "2023-07-31T05:10:51.480Z",
            "maxUsages": 1,
            "assignedUser": {
                "id": "9037b596-684d-4600-af4c-c9a677a3df2f",
                "createdAt": "2023-07-31T05:16:19.997Z",
                "usages": 0,
                "userId": "user1"
            }
        }
    }
}
```

##### ~RedeemCoupon~
```
POST /redeem HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Content-Length: 48

{
    "userId": "user1",
    "couponCode": "1"
}
```
returns
```
{
    "data": {
        "id": "926a1a2f-3863-4845-86f2-bad067fb9075",
        "createdAt": "2023-07-31T05:23:48.686Z",
        "usages": 1,
        "userId": "user1",
        "coupon": {
            "id": "15bba248-4ca9-4aea-933e-40075f471c0a",
            "createdAt": "2023-07-31T05:23:44.735Z",
            "couponCode": "1",
            "couponType": "STANDARD",
            "discountAmount": 20,
            "discountType": "FLAT",
            "expiryDate": "2023-08-31T05:10:51.480Z",
            "maxUsages": 1,
            "assignedUser": {
                "id": "926a1a2f-3863-4845-86f2-bad067fb9075",
                "createdAt": "2023-07-31T05:23:48.686Z",
                "usages": 1,
                "userId": "user1"
            }
        }
    }
}
```

##### ~ValidateCoupon~
```
GET /validate?userId=user1&couponCode=1 HTTP/1.1
Host: localhost:8000
```
returns
```
{
    "error": {
        "code": 429,
        "message": "Coupon exhausted"
    }
} w
```