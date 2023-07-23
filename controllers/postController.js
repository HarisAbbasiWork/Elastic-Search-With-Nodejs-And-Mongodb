const userModel = require('../models/userModel');
const bcrypt = require("bcrypt");
const ObjectId = require('mongodb').ObjectID;
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const postModel = require('../models/postModel');
const elasticClient = require("../config/elasticSearch.js");

const createPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const newPost = await new postModel({
            title: title,
            description: description,
            userId: req.userId,
        }).save();
        console.log("newPost ", newPost)
        // await elasticClient.indices.create({
        //     index: "posts",
        //     body: {
        //         mappings: {
        //             properties: {
        //                 title: { type: "text" }, // Example: Assuming "title" is of type "text"
        //                 description: { type: "text" }, // Example: Assuming "description" is of type "text"
        //                 id: { type: "text" }, // Example: Assuming "id" is of type "keyword"
        //                 createdAt: { type: "date" }, // Explicitly set "createdat" as a "date" field
        //                 updatedAt: { type: "date" },
        //             },
        //         },
        //     },
        // });
        const postOnElastic = await elasticClient.index({
            index: "posts",
            body: {
                title: title,
                description: description,
                id: newPost._id,
                createdAt: newPost.createdAt,
                updatedAt: newPost.updatedAt
            },
        });
        console.log("postOnElastic ", postOnElastic)

        console.log("Post has been added");
        res.status(200).send({
            success: true,
            message: "Post has been added",
            post: newPost,
        });
    } catch (error) {
        console.log("Request Failed:", error);
        res.status(404).send({
            success: false,
            message: "Request Failed",
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const filter = {};
        const posts = await postModel.find(filter);

        res.status(200).json({
            success: true,
            message: "Posts found",
            posts: posts,
        });
    } catch (error) {
        console.log("Error retrieving posts:", error);
        res.status(500).send({
            success: false,
            message: "Error retrieving posts",
        });
    }
};

const searchPosts = async (req, res) => {
    try {
        let { query, pageNo } = req.params;
        const pageSize=15
        pageNo=pageNo-1;
        console.log("query, pageNo ",query, pageNo)
        const { body } = await elasticClient.search({
            index: 'posts',
            from: pageNo*pageSize,
            size: pageSize,
            body: {
                query: {
                    bool: {
                        should: [
                            {
                                regexp: {
                                    title: {
                                        value: `.*${query}.*`,
                                    },
                                },
                            },
                            {
                                regexp: {
                                    description: {
                                        value: `.*${query}.*`,
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        });

        const hits = body.hits.hits;
        const posts = hits.map((hit) => hit._source);

        console.log("posts:", posts);
        res.status(200).json({
            success: true,
            message: "Posts found",
            posts: posts,
        });
    } catch (error) {
        console.log("Error searching posts:", error);
        res.status(500).send({
            success: false,
            message: "Error searching posts",
        });
    }
};

const filterPostsByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        console.log("startDate,endDate ", startDate, endDate)
        const { body } = await elasticClient.search({
            index: 'posts',
            body: {
                query: { // Add the 'query' key here
                    bool: {
                        filter: [
                            {
                                range: {
                                    createdAt: {
                                        gte: startDate,
                                        lte: endDate
                                    }
                                }
                            }
                        ]
                    }
                }
            },
        });


        const hits = body.hits.hits;
        const posts = hits.map((hit) => hit._source);

        console.log("posts:", posts);
        res.status(200).json({
            success: true,
            message: "Posts found",
            posts: posts,
        });
    } catch (error) {
        console.log("Error searching posts:", error.meta);
        if (error.meta) {
            console.log("error.meta ", error.meta)
        }
        res.status(500).send({
            success: false,
            message: "Error searching posts",
        });
    }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postModel.findOne({ "_id": id });

        if (post) {
            return res.status(200).send({
                success: true,
                post: post,
            });
        } else {
            console.log("Post not found");
            return res.status(404).send({
                success: false,
                message: 'Post not found',
            });
        }
    } catch (error) {
        console.log("Error retrieving post by ID:", error);
        res.status(500).send({
            success: false,
            message: "Error retrieving post by ID",
        });
    }
};
const deletePostById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await postModel.deleteOne({ "_id": id });
        console.log("deletedPost ", deletedPost)
        const { body } = await elasticClient.deleteByQuery({
            index: 'posts',
            body: {
                query: {
                    term: { id: id },
                },
            },
        });

        console.log("Deleted post:", body);
        if (deletedPost.n > 0) {
            return res.status(200).send({
                success: true,
                message: "Post has been deleted",
            });
        } else {
            console.log("Post not found");
            return res.status(404).send({
                success: false,
                message: 'Post not found',
            });
        }
    } catch (error) {
        console.log("Error retrieving post by ID:", error);
        res.status(500).send({
            success: false,
            message: "Error retrieving post by ID",
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    searchPosts,
    deletePostById,
    filterPostsByDate
};
