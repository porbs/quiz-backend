# QUIZ BACKEND
Backend for Quiz app

# API usage

* **GET** all documents from database
    ```
    GET <server uri>/api/
    ```
* **CREATE** document
    ```
    POST <server uri>/api
    ```
    * true-false question type
        ```json
        {
            "type": "true-false-question",
            "question": {
                "value": "Are you OK?"
            },
            "answer": {
                "value": true
            }
        }
        ```
    * one-from-four question type
        ```json
        {
            "type": "one-from-four-question",
            "question": {
                "value": "Are you OK?",
                "options": [
                	{ "value": "Yes" },
                	{ "value": "No" },
                	{ "value": "Perhaps" },
                	{ "value": "I don't know..." }
                ]
            },
            "answer": [
            	{ "value": "Yes", "price": 1.0 },
            	{ "value": "No", "price": 0.0 },
            	{ "value": "Perhaps", "price": 0.5 },
            	{ "value": "I don't know...", "price": 0.25 }
            ]
        }
        ```
    * n-from-four question type
        ```json
        {
            "type": "n-from-four-question",
            "question": {
                "value": "Choose flowers only",
                "options": [
                	{ "value": "Rose" },
                	{ "value": "Violet" },
                	{ "value": "Ketchup" },
                	{ "value": "Banana" }
                ]
            },
            "answer": [
            	{ "value": "Rose", "sign": true },
            	{ "value": "Violet", "sign": true },
            	{ "value": "Ketchup", "sign": false },
            	{ "value": "Banana", "sign": false }
            ]
        }
        ```
    * number question type
        ```json
        {
            "type": "number-question",
            "question": {
                "value": "8 800 555 35 3*"
            },
            "answer": {
                "value": 5
            }
        }
        ```
    * word question type
        ```json
        {
            "type": "word-question",
            "question": {
                "value": "Hello darkness, my old ..."
            },
            "answer": {
                "value": "friend"
            }
        }
        ```
    * interval question type
        ```json
        {
            "type": "interval-question",
            "question": {
                "value": "WWII period?"
            },
            "answer": {
                "value": {
                    "from": 1939,
                    "to": 1945,
                    "allowedError": 1
                }
            }
        }
        ```
* **GET** all tasks (documents without answers)
    ```
    GET <server uri>/api/tasks
    ```
* **SUBMIT** answers - upload user answers and calculate the result
    ```
    POST <server uri>/api/submit
    ```
    ```json
    [
    	{
    		"_id": "5ba619e56eefe4350cfe9410",
    		"answer": {
    			"value": false
    		}
    	},
    	{
    		"_id": "5ba61a816eefe4350cfe9411",
    		"answer": {
    			"value": false
    		}
    	},
    	{
    		"_id": "5ba6394e89129916c88ad747",
    		"answer": {
    			"value": "Perhaps"
    		}
    	},
    	{
    		"_id": "5ba64e212eef763b201cf1ea",
    		"answer": [
    			{"value": "Banana"},
    			{"value": "Rose"},
    			{"value": "Violet"}
    		]
    	},
        {
            "_id": "5baa602eb77e66267c991496",
            "answer": {
                "value": 6
            }
        },
        {
            "_id": "5baa613cb77e66267c991497",
            "answer": {
                "value": "FrIeNd"
            }
        },
        {
            "_id": "5baa7f145e8aa93350a34bc6",
            "answer": {
                "value": {
                    "from": 1939,
                    "to": 1947
                }
            }
        }
    ]
    ```