import { GetItemCommand, DeleteItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import db from '../db'


interface responseInterface {
    statusCode: number,
    body: string
}

const   tableName = "blog";

const getBlog = async (event) => {
    const response: responseInterface = { statusCode: 200, body: '' };

    try {
        const params = {
            TableName: tableName,
            Key: marshall({ blogId: event.pathParameters.blogId }),
        };

        const { Item } = await db.send(new GetItemCommand(params));

        console.log({ Item });

        response.body = JSON.stringify({
            message: "Successfully retrived data",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get blog",
            errorMsg: e.message,
            errorStack: e.stack,
        })
    }

    return response;
}


const createBlog = async (event) => {
    const response: responseInterface = { statusCode: 200, body: '' };

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: tableName,
            Item: marshall(body || {}),
        };
        const createResult = await db.send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully created blog.",
            createResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create blog.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const updateBlog = async (event) => {
    const response: responseInterface = { statusCode: 200, body: '' };

    try {
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: tableName,
            Key: marshall({ blogId: event.pathParameters.blogId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await db.send(new UpdateItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully updated blog.",
            updateResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update blog.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const deleteBlog= async (event) => {
    const response: responseInterface = { statusCode: 200, body: '' };

    try {
        const params = {
            TableName: tableName,
            Key: marshall({ blogId: event.pathParameters.blogId }),
        };
        const deleteResult = await db.send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully deleted blog.",
            deleteResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete blog.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const getAllBlogs = async () => {
    const response: responseInterface = { statusCode: 200, body: '' };

    try {
        const { Items } = await db.send(new ScanCommand({ TableName: tableName }));

        response.body = JSON.stringify({
            message: "Successfully retrieved all blogs.",
            data: Items?.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve blogs.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

module.exports = {
    getAllBlogs, 
    deleteBlog,
    updateBlog,
    createBlog,
    getBlog,
}