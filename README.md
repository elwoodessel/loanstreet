This project contains all of the proper cloudformation templates needed to the resources necessary for the loanstreets loans api in aws.

+ There are templates for Storage, Database, API, and Web Server functionality.

+ Requests to create, modify, or view loans are filtered through API Gateway and rerouted to a nodejs lamdba function

+ The lamdba function then makes the appropriate call to dynamodb in order to perform the requested action.

+ This architecture is definitely a POC and will not scale well once there is large amounts of data.

+ Dynamodb was used instead of a traditional relational database in order to stay within the free tier of AWS.

+ The project does not contain a ton of error handling or validations, however it is functional.

+ A sample programmable client is available here https://github.com/elwoodessel/loanstreet-client
