/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function (callback) {
        "use strict";

        var pipeline = [{
                "$group": {
                    _id: "$category",
                    num: {
                        "$sum": 1
                    }
                }
            },
            {
                "$sort": {
                    _id: 1
                }
            }
        ];

        this.db.collection("item").aggregate(pipeline).toArray(function (err, categories) {
            assert.equal(null, err);

            var total = 0;
            for (var i = 0; i < categories.length; i++) {
                total += categories[i].num;
            }

            categories.unshift({
                _id: "All",
                num: total
            });

            callback(categories);
        });
    }


    /*
     * TODO-lab1B
     */
    this.getItems = function (category, page, itemsPerPage, callback) {
        "use strict";

        var queryDoc;
        if (category == "All") {
            queryDoc = {};
        } else {
            queryDoc = {
                category: category
            };
        }

        var cursor = this.db.collection("item").find(queryDoc);
        cursor.skip(page * itemsPerPage);
        cursor.limit(itemsPerPage);
        cursor.toArray(function (err, pageItems) {
            assert.equal(null, err);
            callback(pageItems);
        });
    }

    /*
     * TODO-lab1C:
     */
    this.getNumItems = function (category, callback) {
        "use strict";

        var queryDoc;
        if (category == "All") {
            queryDoc = {};
        } else {
            queryDoc = {
                category: category
            };
        }

        this.db.collection("item").find(queryDoc).count(function (err, count) {
            assert.equal(null, err);
            callback(count);
        });
    }

    /*
     * TODO-lab2A
     */
    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";
    
        var queryDoc = { $text: { $search: query } };
        this.db.collection('item').find(queryDoc)
                                    .limit(itemsPerPage)
                                    .skip(page * itemsPerPage)
                                    .toArray(function(err, items) {
                                        // assert.equal(err, null);
                                        callback(items);
                                    }
        );
    }


    /*
     * TODO-lab2B
     */
    this.getNumSearchItems = function(query, callback) {
        "use strict";
    
        var queryDoc = { $text: { $search: query } };
        this.db.collection('item').find(queryDoc).count(function(err, count) {
            // assert.equal(err, null);
            callback(count);
        });
    }


    this.getItem = function (itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */
        // TODO-lab3 Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the matching item
        // to the callback.

        this.db.collection("item").find({_id: itemId}).toArray(function(err, docs) {
            assert.equal(null, err);
    
            var itemDoc = null;
            if (docs.length > 0) {
                itemDoc = docs[0];
            }
    
            callback(itemDoc);
    
        });
    }


    this.getRelatedItems = function (callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function (err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };

    
    
            /*
             * TODO-lab4
             * LAB #4: Implement addReview().
             */
    this.addReview = function (itemId, comment, name, stars, callback) {
        "use strict";

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };

        // TODO replace the following two lines with your code that will
        // update the document with a new review. Include the following line in the appropriate
        // place within your code to pass the updated doc to the callback.
        this.db.collection("item").updateOne(
            {_id: itemId},
            {"$push": {reviews: reviewDoc}},
            function(err, doc) {
                assert.equal(null, err);
                callback(doc);
        });    
    }


    this.createDummyItem = function () {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;